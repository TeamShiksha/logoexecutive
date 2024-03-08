import {render, screen, fireEvent} from '@testing-library/react';
import AdminTable from './AdminTable';

const mockAdminDetails = [
	{
		email: 'admin1@example.com',
		reason: 'Reason 1',
		createDate: '2022-03-01',
	},
	{
		email: 'admin2@example.com',
		reason: 'Reason 2',
		createDate: '2022-03-02',
	},
];

const mockAdminTableHeadings = ['EMAIL', 'REASON', 'ACTION', 'CREATE DATE'];
describe('AdminTable', () => {
	const mockDeleteAdmin = jest.fn();

	it('renders the table headings correctly', () => {
		render(
			<AdminTable
				adminDetails={mockAdminDetails}
				deleteAdmin={mockDeleteAdmin}
			/>,
		);

		mockAdminTableHeadings.forEach((heading, index) => {
			expect(screen.getByText(heading)).toBeInTheDocument();
		});
	});

	it('renders each admin detail row correctly', () => {
		render(
			<AdminTable
				adminDetails={mockAdminDetails}
				deleteAdmin={mockDeleteAdmin}
			/>,
		);

		mockAdminDetails.forEach((admin, index) => {
			expect(screen.getByText(admin.email)).toBeInTheDocument();
			expect(screen.getByText(admin.reason)).toBeInTheDocument();
			expect(screen.getByText(admin.createDate)).toBeInTheDocument();
		});
	});

	it('calls deleteAdmin function when delete button is clicked', () => {
		render(
			<AdminTable
				adminDetails={mockAdminDetails}
				deleteAdmin={mockDeleteAdmin}
			/>,
		);

		// Click delete button for the first admin
		fireEvent.click(screen.getAllByRole('button')[0]);

		// Check that deleteAdminMock was called with the correct email
		expect(mockDeleteAdmin).toHaveBeenCalledWith('admin1@example.com');
	});
});
