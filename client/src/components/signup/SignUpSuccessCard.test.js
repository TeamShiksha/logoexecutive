import {render, screen} from '@testing-library/react';
import SignUpSuccessCard from './SignUpSuccessCard';

describe('SignUpSuccessCard', () => {
	test('renders SignUpSuccessCard component', () => {
		render(<SignUpSuccessCard />);

		expect(
			screen.getByText('Sign-Up Submission Successful'),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				/Please check your email for a verification link. Your account must be verified before you can sign in./i,
			),
		).toBeInTheDocument();
		expect(screen.getByTitle('Success Icon')).toBeInTheDocument();
	});
});
