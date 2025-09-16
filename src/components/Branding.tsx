import { useLogo } from '../store/logo';

export function Branding() {
	const { logoUrl } = useLogo();

	return (
		<div className="branding">
			{logoUrl ? (
				<img
					src={logoUrl}
					alt="Company Logo"
					style={{
						maxHeight: '50px',
						maxWidth: '200px',
						objectFit: 'contain',
						cursor: 'default'
					}}
				/>
			) : (
				<h1 className="brand-text">THRUART</h1>
			)}
		</div>
	);
}

