import { render, screen } from '@testing-library/react'
import Login from './Login'
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

describe('Login', () => {
  it('should render without crashing', () => {

    render(<MemoryRouter><Login /></ MemoryRouter>)
    
    expect( screen.getByText('Login to Yoga Studio')).toBeInTheDocument()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
    expect(screen.getByRole('button', { type: 'submit' })).toBeInTheDocument()
  })

  it('should show error if login fails', async () => {
    authService.login = (email,password) => { throw({ response: { data: { message: "erreur "}}}) };
    const user = userEvent.setup()
    render(<MemoryRouter><Login /></ MemoryRouter>)

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    const submitButton = screen.getByRole('button', { type: 'submit' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '12345')
    await user.click(submitButton)

    expect(screen.getByText("erreur")).toBeInTheDocument()
    
  })

  it('should show connect if login succeeds', async () => {
    authService.login = (email,password) => true
    const user = userEvent.setup()
    render(<MemoryRouter><Login /></ MemoryRouter>)

    const emailInput = screen.getByLabelText("Email")
    const passwordInput = screen.getByLabelText("Password")
    const submitButton = screen.getByRole('button', { type: 'submit' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '12345')
    await user.click(submitButton)

    expect(mockUseNavigate).toHaveBeenCalledWith('/sessions')
  })

})