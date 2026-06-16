import { render, screen, waitFor } from '@testing-library/react'
import Profile from './Profile'
import { authService } from '../services/auth.service.ts';
import { beforeAll, beforeEach } from 'vitest';
import { server } from '../test/mocks/server'
import { handlers, deleteUserHandler, promoteAdminHandler } from '../test/mocks/handlers'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'

const mockedUseNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useNavigate: () => mockedUseNavigate,
  };
});

beforeAll(() => {
  authService.getCurrentUser = () => ({ id: 1 })
})

describe('Login', () => {
  it('should render without crashing', () => {

    render(<Profile />)
    
    const title = screen.getByText('Loading profile...')
    expect(title).toBeInTheDocument()
  })

  it('should display user info', async () => {

    render(<Profile />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText("My Profile")).toBeInTheDocument()
  })

  it('should display an error if fetch fails', async () => {
    
    server.use(
      http.get('/api/user/:id', () => {
        throw("erreur")
      })
    )

    render(<Profile />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText("Failed to load user information")).toBeInTheDocument()
  })

  it('should delete user if user clicks delete button', async () => {
    server.use(...handlers)
    const user = userEvent.setup()
    window.confirm = () => true

    render(<Profile />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument()
    })
    
    const deleteButton = screen.getByRole("button", { name: "Delete Account"})

    await user.click(deleteButton)

    await waitFor(() => {
      expect(deleteUserHandler).toHaveBeenCalledWith("1")
    })

  })

  it('should display error if delete fails', async () => {
    server.use(
      http.delete('/api/user/:id', () => {
        throw("erreur")
      })
    )

    const user = userEvent.setup()
    window.confirm = () => true
    alert = vi.fn()

    render(<Profile />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument()
    })
    
    const deleteButton = screen.getByRole("button", { name: "Delete Account"})

    await user.click(deleteButton)

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Failed to delete account')
    })

  })

  it('should promote user if user clicks promote button', async () => {
    server.use(...handlers)
    const user = userEvent.setup()

    render(<Profile />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument()
    })
    
    const promoteButton = screen.getByRole("button", { name: "Promote to Admin (Dev)"})

    await user.click(promoteButton)

    await waitFor(() => {
      expect(promoteAdminHandler).toHaveBeenCalled()
    })

  })

  it('should redirect to sessions when user clicks back button', async () => {
    const user = userEvent.setup()

    render(<Profile />)

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: "Back to Sessions"}))

    expect(mockedUseNavigate).toHaveBeenCalledWith('/sessions')
  })

  it('displays promote error message after failed promotion', async () => {
    server.use(http.post('/api/user/promote-admin', () => {
      return HttpResponse({ status: 500 })
    }));

    render(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument()
    })

    const promoteButton = screen.getByRole("button", { name: "Promote to Admin (Dev)"})
    const user = userEvent.setup();
    await user.click(promoteButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to promote to admin')).toBeInTheDocument();
    });
  })

  it('displays admin badge correctly', async () => {
    server.use(
        http.get('/api/user/:id', () => {
          return HttpResponse.json({ 
                firstName: "Bob", 
                lastName: "Sponge",
                email: "email@email.com",
                createdAt: new Date(),
                admin: true
            })
        })
      )

    render(<Profile />);

    await waitFor(() => {
      expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument()
    })
  
    expect(screen.getByText('Administrator')).toBeInTheDocument()
  })
})