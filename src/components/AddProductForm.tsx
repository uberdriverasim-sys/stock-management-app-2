import { useState } from 'react';
import { useInventory } from '../store/inventory';

export function AddProductForm() {
	const { addOrUpdateProduct } = useInventory();
	const [id, setId] = useState('');
	const [name, setName] = useState('');
	const [quantity, setQuantity] = useState<number | ''>('');
	const [error, setError] = useState<string | null>(null);
	const [ok, setOk] = useState<string | null>(null);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setOk(null);
		const q = typeof quantity === 'string' ? Number.NaN : quantity;
		
		const result = await addOrUpdateProduct(id.trim(), name.trim(), Number(q));
		if (!result.success) {
			setError(result.message);
		} else {
			setOk(result.message);
			setId('');
			setName('');
			setQuantity('');
		}
	};

	return (
		<form onSubmit={onSubmit} style={{ 
			display: 'grid', 
			gap: 16, 
			maxWidth: 560
		}}>
			<div style={{ display: 'grid', gap: 6 }}>
				<label htmlFor="sku">SKU</label>
				<input
					id="sku"
					placeholder="e.g., ABC-001"
					value={id}
					onChange={(e) => setId(e.target.value)}
				/>
			</div>
			<div style={{ display: 'grid', gap: 6 }}>
				<label htmlFor="name">Name</label>
				<input
					id="name"
					placeholder="e.g., Blue T-Shirt"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</div>
			<div style={{ display: 'grid', gap: 6 }}>
				<label htmlFor="qty">Quantity</label>
				<input
					id="qty"
					type="number"
					min={0}
					step={1}
					placeholder="0"
					value={quantity}
					onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
				/>
			</div>
			<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
				<button type="submit">Save</button>
				{error && <span style={{ color: 'crimson' }}>{error}</span>}
				{ok && <span style={{ color: 'seagreen' }}>{ok}</span>}
			</div>
		</form>
	);
}
