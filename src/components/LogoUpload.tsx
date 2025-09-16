import { useRef, useState } from 'react';
import { useLogo } from '../store/logo';

export function LogoUpload() {
	const { logoUrl, uploadLogo, removeLogo, isUploading } = useLogo();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const handleFileSelect = async (file: File) => {
		setMessage(null);
		const result = await uploadLogo(file);
		setMessage({
			type: result.success ? 'success' : 'error',
			text: result.message
		});

		// Clear message after 3 seconds
		setTimeout(() => setMessage(null), 3000);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		
		const file = e.dataTransfer.files[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div style={{ display: 'grid', gap: 16 }}>
			<h3 style={{ margin: 0, color: 'var(--text-dark)' }}>Company Logo</h3>
			
			{/* Current Logo Display */}
			{logoUrl && (
				<div style={{
					display: 'flex',
					alignItems: 'center',
					gap: 16,
					padding: 16,
					background: 'white',
					borderRadius: 8,
					border: '1px solid #E9ECEF'
				}}>
					<img
						src={logoUrl}
						alt="Company Logo"
						style={{
							width: 80,
							height: 60,
							objectFit: 'contain',
							border: '1px solid #E9ECEF',
							borderRadius: 4
						}}
					/>
					<div style={{ flex: 1 }}>
						<div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Current Logo</div>
						<div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
							This logo appears in the top-left corner of the app
						</div>
					</div>
					<button
						onClick={removeLogo}
						style={{
							padding: '6px 12px',
							background: '#DC3545',
							color: 'white',
							border: 'none',
							borderRadius: 4,
							fontSize: '0.8rem',
							cursor: 'pointer'
						}}
					>
						Remove
					</button>
				</div>
			)}

			{/* Upload Area */}
			<div
				onClick={handleClick}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				style={{
					border: `2px dashed ${dragOver ? 'var(--primary-orange)' : '#D1D5DB'}`,
					borderRadius: 8,
					padding: 32,
					textAlign: 'center',
					cursor: 'pointer',
					background: dragOver ? 'rgba(255, 107, 53, 0.05)' : '#F9FAFB',
					transition: 'all 0.2s ease'
				}}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileInputChange}
					style={{ display: 'none' }}
				/>
				
				{isUploading ? (
					<div style={{ color: 'var(--text-light)' }}>
						<div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>
						<div>Uploading logo...</div>
					</div>
				) : (
					<div style={{ color: 'var(--text-light)' }}>
						<div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
						<div style={{ fontWeight: 600, marginBottom: 4 }}>
							{logoUrl ? 'Replace Logo' : 'Upload Company Logo'}
						</div>
						<div style={{ fontSize: '0.9rem' }}>
							Click to browse or drag and drop
						</div>
						<div style={{ fontSize: '0.8rem', marginTop: 8 }}>
							Supports: JPG, PNG, GIF (Max 2MB)
						</div>
					</div>
				)}
			</div>

			{/* Success/Error Message */}
			{message && (
				<div style={{
					padding: '12px 16px',
					borderRadius: 8,
					background: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
					border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
					color: message.type === 'success' ? '#065F46' : '#991B1B',
					fontSize: '0.9rem'
				}}>
					{message.text}
				</div>
			)}

			{/* Instructions */}
			<div style={{
				padding: 16,
				background: 'var(--light-gray)',
				borderRadius: 8,
				fontSize: '0.85rem',
				color: 'var(--text-light)'
			}}>
				<div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-dark)' }}>
					💡 Logo Guidelines:
				</div>
				<ul style={{ margin: 0, paddingLeft: 16 }}>
					<li>Use PNG or SVG for best quality with transparent backgrounds</li>
					<li>Recommended size: 200x80 pixels or similar aspect ratio</li>
					<li>Keep file size under 2MB for optimal performance</li>
					<li>Logo will be automatically resized to fit the header area</li>
				</ul>
			</div>
		</div>
	);
}

