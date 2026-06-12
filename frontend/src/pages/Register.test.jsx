import { render, screen } from '@testing-library/react'
import Register from './Register.tsx'
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event'
import { authService } from '../services/auth.service.ts';

const mockUseNavigate = vi.fn((path) => path);
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useNavigate: () => mockUseNavigate,
  };
});

describe('Register', () => {
  it('should render without crashing', () => {

    render(<MemoryRouter><Register /></ MemoryRouter>)
    
    expect( screen.getByText('Register for Yoga Studio')).toBeInTheDocument()
    expect(screen.getByLabelText("First Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByRole('button', { type: 'submit' })).toBeInTheDocument()
  })

  it('should display error if registration fails', async () => {
    authService.register = (data) => { throw({ response: { data: { message: "erreur "}}}) };
    const user = userEvent.setup()
    render(<MemoryRouter><Register /></ MemoryRouter>)

    const firstNameInput = screen.getByLabelText("First Name")
    const lastNameInput = screen.getByLabelText("Last Name")
    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    const submitButton = screen.getByRole('button', { type: 'submit' })

    await user.type(firstNameInput, 'first name')
    await user.type(lastNameInput, 'last name')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '1234578')
    await user.click(submitButton)

    expect(screen.getByText("erreur")).toBeInTheDocument()
    
  })

  it('should show register if registration succeeds', async () => {
    authService.register = (data) => true
    const user = userEvent.setup()
    render(<MemoryRouter><Register /></ MemoryRouter>)

    const firstNameInput = screen.getByLabelText("First Name")
    const lastNameInput = screen.getByLabelText("Last Name")
    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    const submitButton = screen.getByRole('button', { type: 'submit' })

    await user.type(firstNameInput, 'first name')
    await user.type(lastNameInput, 'last name')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '1234578')
    await user.click(submitButton)

    expect(mockUseNavigate).toHaveBeenCalledWith('/sessions')
  })

})