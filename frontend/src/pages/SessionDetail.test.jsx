import { render, screen, waitFor } from '@testing-library/react'
import SessionDetail from './SessionDetail'
import userEvent from '@testing-library/user-event'
import { authService } from '../services/auth.service.ts';
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'
import { postParticipationHandler, deleteParticipationHandler, deleteSessionHandler, handlers } from '../test/mocks/handlers.js';

const mockUseNavigate = vi.fn((path) => path);
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useNavigate: () => mockUseNavigate,
    useParams: () => ({ id: 1 })
  };
});

describe('Sessions', () => {
  it('should show loading state initially', () => {

    render(<SessionDetail />)
    
    expect(screen.getByText('Loading session...')).toBeInTheDocument()
  })

  it('should display session data after successful fetch', async () => {
    render(<SessionDetail />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading session...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Session 1')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Join Session"})).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Back to Sessions"})).toBeInTheDocument()
  })

  it('should display edit/delete buttons if user is admin', async () => {
    authService.getCurrentUser = () => ({ admin: true })
    
    render(<SessionDetail />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading session...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByRole('button', { name: "Edit"})).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Delete"})).toBeInTheDocument()
  })

    it('should call post on participate', async () => {
        authService.getCurrentUser = () => ({ id: 1, admin: false })
        const user = userEvent.setup()

        render(<SessionDetail />);

        await waitFor(() => {
            expect(screen.queryByText('Loading session...')).not.toBeInTheDocument()
        })

        const participateButton = screen.getByRole('button', { name: "Join Session"})

        await user.click(participateButton)
    
        expect(postParticipationHandler).toHaveBeenCalledWith({ id: "1", uid: "1" })
    });

    it('should display leave session button if user has joined', async () => {
        authService.getCurrentUser = () => ({ id: 1, admin: false })
        server.use(
        http.get('/api/session/:id', ({ params }) => {
            const { id } = params 
            return HttpResponse.json(
                { id: 1, name: "Session 1", date: new Date(), description: "Description 1", users: [1], teacher :{ firstName: "John", lastName: "Doe" }})
            })
        )

        render(<SessionDetail />)
        
        await waitFor(() => {
            expect(screen.queryByText('Loading session...')).not.toBeInTheDocument()
        })
        
        expect(screen.getByRole('button', { name: "Leave Session"})).toBeInTheDocument()
    })

    it('should call delete on leave session', async () => {
        authService.getCurrentUser = () => ({ id: 1, admin: false })
        const user = userEvent.setup()
        server.use(
          http.get('/api/session/:id', ({ params }) => {
            const { id } = params 
            return HttpResponse.json(
                { id: 1, name: "Session 1", date: new Date(), description: "Description 1", users: [1], teacher :{ firstName: "John", lastName: "Doe" }})
            })
        )

        render(<SessionDetail />)
        
        await waitFor(() => {
            expect(screen.queryByText('Loading session...')).not.toBeInTheDocument()
        })
        
        const leaveButton = screen.getByRole('button', { name: "Leave Session"})

        await user.click(leaveButton)
    
        expect(deleteParticipationHandler).toHaveBeenCalledWith({ id: "1", uid: "1" })
    })

    it('should call delete if user click delete button', async () => {
        const user = userEvent.setup()
        authService.getCurrentUser = () => ({ admin: true })
        window.confirm = () => true

        render(<SessionDetail />)
        
        await waitFor(() => {
            expect(screen.queryByText('Loading session...')).not.toBeInTheDocument()
        })
        
        const deleteButton = screen.getByRole('button', { name: "Delete"})

        await user.click(deleteButton)

        await waitFor(() => {
          expect(deleteSessionHandler).toHaveBeenCalledWith("1")
        })
    })

    it('should display error if fetch fails', async () => {
      server.use(
        http.get('/api/session/:id', () => {
          return new HttpResponse(null, { status: 404 })
        })
      )

      render(<SessionDetail />)
      
      await waitFor(() => {
        expect(screen.queryByText('Loading session...')).not.toBeInTheDocument()
      })
    
    expect(screen.getByText('Failed to load session details')).toBeInTheDocument()
  })

  it('should redirect to sessions when user clicks cancel button', async () => {
    server.use(...handlers)
    const user = userEvent.setup()

    render(<SessionDetail />)

    await waitFor(() => {
      expect(screen.queryByText('Loading session...')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: "Back to Sessions"}))

    expect(mockUseNavigate).toHaveBeenCalledWith('/sessions')
  })
})