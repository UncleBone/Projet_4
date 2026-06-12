import { render, screen } from '@testing-library/react'
import Navbar from './Navbar.tsx'
import { mount } from '@vue/test-utils'
import { MemoryRouter } from 'react-router-dom'
import { authService } from '../services/auth.service.ts';
import userEvent from '@testing-library/user-event'

const mockUseNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useNavigate: () => mockUseNavigate,
  };
});

describe('Navbar', () => {
  it('should render without crashing', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)

    const title = screen.getByText('Yoga Studio')
    
    expect(title).toBeInTheDocument()
  })

  it('should display login when not authenticated', () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    
    const login = screen.getByText('Login');
    
    expect(login).toBeInTheDocument()
  })

  it('should display profile when authenticated', () => {
    authService.isAuthenticated = () => true;
    
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('should display Create Session when authenticated & admin', () => {
    authService.isAuthenticated = () => true;
    authService.getCurrentUser = () => ({ name: 'mockedUser', admin: true });
    
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    
    expect(screen.getByText('Create Session')).toBeInTheDocument()
  })

  it('should logout when clicking logout', async () => {
    const user = userEvent.setup()
    const mockLogout = vi.fn()
    authService.isAuthenticated = () => true;
    authService.logout = mockLogout
    
    render(<MemoryRouter><Navbar /></MemoryRouter>)
    
    const button = screen.getByRole('button', { name: "Logout" })

    await user.click(button)

    expect(mockLogout).toHaveBeenCalled()
    expect(mockUseNavigate).toHaveBeenCalledWith('/login')
  })  
})