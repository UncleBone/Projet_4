import { render, screen, waitFor } from '@testing-library/react'
import Sessions from './Sessions.tsx'
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event'
import { authService } from '../services/auth.service.ts';
import { http, HttpResponse } from 'msw'
import { server } from '../test/mocks/server'


const mockUseNavigate = vi.fn((path) => path);
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useNavigate: () => mockUseNavigate,
  };
});

describe('Sessions', () => {
  it('should show loading state initially', () => {

    render(<MemoryRouter><Sessions /></ MemoryRouter>)
    
    expect(screen.getByText('Loading sessions...')).toBeInTheDocument()
  })

  it('should display sessions data after successful fetch', async () => {
    render(<MemoryRouter><Sessions /></ MemoryRouter>)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading sessions...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Session 1')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getAllByText('View Details')[0]).toBeInTheDocument()
    expect(screen.getByText('Session 2')).toBeInTheDocument()
    expect(screen.getByText('Description 2')).toBeInTheDocument()
    expect(screen.getAllByText('View Details')[1]).toBeInTheDocument()
  })

  it('should display delete button if user is admin', async () => {
    authService.getCurrentUser = () => ({ admin: true })

    render(<MemoryRouter><Sessions /></ MemoryRouter>)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading sessions...')).not.toBeInTheDocument()
    })
    
    expect(screen.getAllByText('Delete')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Delete')[1]).toBeInTheDocument()
  })

  it('should display create button if user is admin', async () => {
    authService.getCurrentUser = () => ({ admin: true })

    render(<MemoryRouter><Sessions /></ MemoryRouter>)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading sessions...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Create Session')).toBeInTheDocument()
  })

  it('should delete session if user click delete button', async () => {
    const user = userEvent.setup()
    authService.getCurrentUser = () => ({ admin: true })
    window.confirm = vi.fn()

    render(<MemoryRouter><Sessions /></ MemoryRouter>)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading sessions...')).not.toBeInTheDocument()
    })
    
    const deleteButton = screen.getAllByText('Delete')[0]

    await user.click(deleteButton)

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this session?')
  })

  it('should display error if fetch fails', async () => {
    server.use(
      http.get('/api/session', () => {
        return new HttpResponse(null, { status: 404 })
      })
    )

    render(<MemoryRouter><Sessions /></ MemoryRouter>)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading sessions...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Failed to load sessions')).toBeInTheDocument()
  })

  it('should display text if sessions is empty', async () => {
    server.use(
      http.get('/api/session', () => {
        return new HttpResponse([])
      })
    )

    render(<MemoryRouter><Sessions /></ MemoryRouter>)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading sessions...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('No sessions available')).toBeInTheDocument()
  })

  


})