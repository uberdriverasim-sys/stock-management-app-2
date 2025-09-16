import { useMemo, useState } from 'react';
import { useInventory } from '../store/inventory';

export function InventoryTable() {
	const { products, removeProduct, totalUnits, addOrUpdateProduct, loading } = useInventory();
	const [query, setQuery] = useState('');

	const rows = useMemo(() => {
		const q = query.trim().toLowerCase();
		const list = q
			? products.filter((p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
			: products;
		return [...list].sort((a, b) => a.sku.localeCompare(b.sku));
	}, [products, query]);

	if (loading) {
		return (
			<div style={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				padding: '40px',
				fontSize: '1.1rem'
			}}>
				📦 Loading inventory from database...
			</div>
		);
	}

	return (
		<div style={{ 
			display: 'grid', 
			gap: 16
		}}>
			<div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
				<input
					className="search-bar"
					placeholder="Search by SKU or name"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					style={{ flex: 1 }}
				/>
				<div className="total-badge">
					📈 Total Units: <strong>{totalUnits}</strong>
				</div>
			</div>
			<div style={{ overflowX: 'auto' }}>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th style={th}>SKU</th>
							<th style={th}>Name</th>
							<th style={th}>Quantity</th>
							<th style={th}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{rows.length === 0 ? (
							<tr>
								<td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#666' }}>
									No products yet.
								</td>
							</tr>
						) : (
							rows.map((p) => (
								<tr key={p.id}>
									<td style={td}>{p.sku}</td>
									<td style={td}>{p.name}</td>
									<td style={td}>
										<input
											type="number"
											min={0}
											step={1}
											value={p.quantity}
											onChange={async (e) => {
												const val = Math.max(0, Number(e.target.value || 0));
												await addOrUpdateProduct(p.sku, p.name, val - p.quantity);
											}}
											style={{ width: 100 }}
										/>
									</td>
									<td style={td}>
										<button onClick={async () => await removeProduct(p.id)}>Remove</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #ddd' };
const td: React.CSSProperties = { padding: '10px 8px', borderBottom: '1px solid #eee', verticalAlign: 'middle' };
