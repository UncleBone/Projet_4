import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { authService } from '../services/auth.service.ts';
import { postSessionHandler, editSessionHandler } from '../test/mocks/handlers.js';
import * as ReactRouterDom from 'react-router-dom';
import SessionForm from './SessionForm'
import { server } from '../test/mocks/server'
import { http, HttpResponse } from 'msw'

const mockUseNavigate = vi.fn((path) => path);
vi.mock("react-router-dom", () => {
    const actual = vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: () => mockUseNavigate,
  };
});

describe('SessionForm', () => {
    let mockedUseParams;

    beforeEach(() => {
        mockedUseParams = ReactRouterDom.useParams;
        mockedUseParams.mockReset();
        mockUseNavigate.mockReset();
    });

  it('should render without crashing', async () => {
    mockedUseParams.mockReturnValue({ id: undefined });

    render(<SessionForm />)
    
    await waitFor(() => 
        expect(screen.getByText('John Doe')).toBeInTheDocument());

    expect( screen.getByText('Create New Session')).toBeInTheDocument()
  })

  it('should post and redirect when complete form is submitted', async () => {
    mockedUseParams.mockReturnValue({ id: undefined });

    const user = userEvent.setup()

    render(<SessionForm />)

    const nameInput = screen.getByLabelText("Session Name")
    const dateInput = screen.getByLabelText("Date")
    const teacherSelect = screen.getByLabelText("Teacher")
    const descriptionInput = screen.getByLabelText("Description")
    const submitButton = screen.getByRole('button', { name: 'Create Session' })

    await user.type(nameInput, 'session name')
    await user.type(dateInput, '2026-06-26')
    await user.selectOptions(teacherSelect, "1");
    await user.type(descriptionInput, 'session description')
    await user.click(submitButton)

    await waitFor(() => expect(postSessionHandler).toHaveBeenCalledWith({
      name: "session name",
      date: "2026-06-26",
      teacherId: 1,
      description: "session description"
    }))

    expect(mockUseNavigate).toHaveBeenCalledWith('/sessions')
  })

  it('should display an error if submit fails', async () => {
    mockedUseParams.mockReturnValue({ id: undefined });

    server.use(
      http.post('/api/session', () => {
        throw("erreur")
      })
    )

    const user = userEvent.setup()

    render(<SessionForm />)

    const nameInput = screen.getByLabelText("Session Name")
    const dateInput = screen.getByLabelText("Date")
    const teacherSelect = screen.getByLabelText("Teacher")
    const descriptionInput = screen.getByLabelText("Description")
    const submitButton = screen.getByRole('button', { name: 'Create Session' })

    await user.type(nameInput, 'session name')
    await user.type(dateInput, '2026-06-26')
    await user.selectOptions(teacherSelect, "1");
    await user.type(descriptionInput, 'session description')
    await user.click(submitButton)

    await waitFor(() => expect(screen.getByText('Failed to save session')).toBeInTheDocument())
  })

  it('should display edit session in edit mode', async () => {
    mockedUseParams.mockReturnValue({ id: '1' });

    render(<SessionForm />)
    
    await waitFor(() => 
        expect(screen.getByText('John Doe')).toBeInTheDocument());

    expect(screen.getByText('Edit Session')).toBeInTheDocument()
  })

  it('should display error if fetch session fails', async () => {
    mockedUseParams.mockReturnValue({ id: '1' });
    
    server.use(
      http.get('/api/session/:id', () => {
        throw("erreur")
      })
    )

    render(<SessionForm />)
    
    await waitFor(() => {
      expect(screen.queryByText('Edit Session')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Failed to load session')).toBeInTheDocument()
  })

  it('should put and redirect when complete edit form is submitted', async () => {
    mockedUseParams.mockReturnValue({ id: '1' });

    const user = userEvent.setup()

    render(<SessionForm />)

    await waitFor(() => 
        expect(screen.getByText('John Doe')).toBeInTheDocument());

    const nameInput = screen.getByLabelText("Session Name")
    const dateInput = screen.getByLabelText("Date")
    const teacherSelect = screen.getByLabelText("Teacher")
    const descriptionInput = screen.getByLabelText("Description")
    const submitButton = screen.getByRole('button', { name: 'Update Session' })

    await user.clear(nameInput);
    await user.type(nameInput, 'session name')
    await user.clear(dateInput);
    await user.type(dateInput, '2026-06-26')
    await user.selectOptions(teacherSelect, "1");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'session description')
    await user.click(submitButton)

    await waitFor(() => 
      expect(editSessionHandler).toHaveBeenCalledWith("1",
        {
          name: "session name",
          date: "2026-06-26",
          teacherId: 1,
          description: "session description"
        }
      ))

    expect(mockUseNavigate).toHaveBeenCalledWith('/sessions')
  })

  it('should display error if fetch teacher fails', async () => {
    mockedUseParams.mockReturnValue({ id: undefined });
    
    server.use(
      http.get('/api/teacher', () => {
        throw("erreur")
        return new HttpResponse(null, { status: 404 })
      })
    )

    render(<SessionForm />)
    
    await waitFor(() => {
      expect(screen.queryByText('Create Session')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Failed to fetch teachers')).toBeInTheDocument()
  })

  it('should redirect to sessions when user clicks cancel button', async () => {
    mockedUseParams.mockReturnValue({ id: undefined });
    const user = userEvent.setup()

    render(<SessionForm />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: "Cancel"})).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: "Cancel"}))

    expect(mockUseNavigate).toHaveBeenCalledWith('/sessions')
  })

})