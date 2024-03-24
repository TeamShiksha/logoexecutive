import styles from './CurrentPlan.module.css';
import Card from '../card/Card';
import {SubscriptionLabels, SubscriptionTypes} from '../../constants';
import Button from '../common/Button/Button';

/**
 * @param {{ subscriptionType: string, isActive: boolean }} [props]
 **/
export default function CurrentPlan(props) {
	return (
		<Card>
			<div className={styles.Container}>
				<div className={styles.Header}>
					<h3 className={styles.HeaderTitle}>Current Plan</h3>
					<span
						className={`${styles.HeaderStatus} ${props.isActive ? styles.HeaderStatus_Active : ''}`}
					>
						{props.isActive ? 'Active' : 'Inactive'}
					</span>
				</div>
				<div className={styles.Content}>
					<h4 className={styles.ContentTitle}>
						{SubscriptionLabels[props.subscriptionType]}
					</h4>
					<p className={styles.Tagline}>
						Empower your projects with essential tools, at no cost.
					</p>
				</div>

				<div className={styles.Footer}>
					{props.subscriptionType === SubscriptionTypes.HOBBY && (
						<Button className={styles.Button}>Upgrade Plan</Button>
					)}
				</div>
			</div>
		</Card>
	);
}
