import { useMemo, useState } from 'react';
import { useRequests } from '../store/requests';
import { useInventory } from '../store/inventory';

export function RequestQueue() {
	const { requests, updateRequestStatus, removeRequest, loading } = useRequests();
	const { decreaseStock, products } = useInventory();
	const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'dispatched' | 'cancelled'>('all');
	const [dispatchMessages, setDispatchMessages] = useState<Record<string, { type: 'success' | 'error'; message: string }>>({});

	const filteredRequests = useMemo(() => {
		const list = filter === 'all' ? requests : requests.filter((req) => req.status === filter);
		return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // newest first
	}, [requests, filter]);

	const statusCounts = useMemo(() => {
		return {
			pending: requests.filter((r) => r.status === 'pending').length,
			approved: requests.filter((r) => r.status === 'approved').length,
			dispatched: requests.filter((r) => r.status === 'dispatched').length,
			cancelled: requests.filter((r) => r.status === 'cancelled').length,
		};
	}, [requests]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	const getProductDetails = (productId: string) => {
		const product = products.find(p => p.id === productId);
		return {
			sku: product?.sku || productId,
			name: product?.name || 'Unknown Product'
		};
	};

	const handleDispatch = async (request: any) => {
		const result = await decreaseStock(request.product_id, request.requested_quantity);
		
		if (result.success) {
			await updateRequestStatus(request.id, 'dispatched');
			setDispatchMessages(prev => ({
				...prev,
				[request.id]: { type: 'success', message: result.message }
			}));
			// Clear message after 3 seconds
			setTimeout(() => {
				setDispatchMessages(prev => {
					const updated = { ...prev };
					delete updated[request.id];
					return updated;
				});
			}, 3000);
		} else {
			setDispatchMessages(prev => ({
				...prev,
				[request.id]: { type: 'error', message: result.message }
			}));
			// Clear error message after 5 seconds
			setTimeout(() => {
				setDispatchMessages(prev => {
					const updated = { ...prev };
					delete updated[request.id];
					return updated;
				});
			}, 5000);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'pending': return '#f59e0b';
			case 'approved': return '#10b981';
			case 'dispatched': return '#3b82f6';
			case 'cancelled': return '#ef4444';
			default: return '#6b7280';
		}
	};

	if (loading) {
		return (
			<div style={{ 
				display: 'flex', 
				justifyContent: 'center', 
				alignItems: 'center', 
				padding: '40px',
				fontSize: '1.1rem'
			}}>
				📋 Loading requests from database...
			</div>
		);
	}

	return (
		<div style={{ 
			display: 'grid', 
			gap: 20
		}}>
			{/* Filter tabs */}
			<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
				{[
					{ key: 'all', label: `All (${requests.length})` },
					{ key: 'pending', label: `Pending (${statusCounts.pending})` },
					{ key: 'approved', label: `Approved (${statusCounts.approved})` },
					{ key: 'dispatched', label: `Dispatched (${statusCounts.dispatched})` },
					{ key: 'cancelled', label: `Cancelled (${statusCounts.cancelled})` },
				].map(({ key, label }) => (
					<button
						key={key}
						onClick={() => setFilter(key as any)}
						style={{
							padding: '8px 12px',
							border: '1px solid #d1d5db',
							borderRadius: '6px',
							background: filter === key ? '#3b82f6' : 'transparent',
							color: filter === key ? 'white' : 'inherit',
							fontSize: '0.875rem',
							cursor: 'pointer',
						}}
					>
						{label}
					</button>
				))}
			</div>

			{/* Requests table */}
			<div style={{ overflowX: 'auto' }}>
				<table style={{ width: '100%', borderCollapse: 'collapse' }}>
					<thead>
						<tr>
							<th style={th}>Shop</th>
							<th style={th}>Location</th>
							<th style={th}>Product</th>
							<th style={th}>Qty</th>
							<th style={th}>Status</th>
							<th style={th}>Requested</th>
							<th style={th}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredRequests.length === 0 ? (
							<tr>
								<td colSpan={7} style={{ padding: 16, textAlign: 'center', color: '#666' }}>
									{filter === 'all' ? 'No requests yet.' : `No ${filter} requests.`}
								</td>
							</tr>
						) : (
							filteredRequests.map((req) => (
								<tr key={req.id}>
									<td style={td}>{req.shop_name}</td>
									<td style={td}>{req.shop_location}</td>
									<td style={td}>
										<div>
											<div style={{ fontWeight: 500 }}>{getProductDetails(req.product_id).sku}</div>
											<div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{getProductDetails(req.product_id).name}</div>
										</div>
									</td>
									<td style={td}>{req.requested_quantity}</td>
									<td style={td}>
										<span
											style={{
												padding: '4px 8px',
												borderRadius: '4px',
												fontSize: '0.75rem',
												fontWeight: 500,
												color: 'white',
												backgroundColor: getStatusColor(req.status),
											}}
										>
											{req.status.toUpperCase()}
										</span>
									</td>
									<td style={td}>
										<div style={{ fontSize: '0.75rem' }}>{formatDate(req.created_at)}</div>
									</td>
									<td style={td}>
										<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
											{req.status === 'pending' && (
												<>
													<button
														onClick={() => updateRequestStatus(req.id, 'approved')}
														style={{ ...actionBtn, background: '#10b981' }}
													>
														Approve
													</button>
													<button
														onClick={() => updateRequestStatus(req.id, 'cancelled')}
														style={{ ...actionBtn, background: '#ef4444' }}
													>
														Cancel
													</button>
												</>
											)}
											{req.status === 'approved' && (
												<button
													onClick={() => handleDispatch(req)}
													style={{ ...actionBtn, background: '#3b82f6' }}
												>
													Dispatch
												</button>
											)}
											<button
												onClick={() => removeRequest(req.id)}
												style={{ ...actionBtn, background: '#6b7280' }}
											>
												Remove
											</button>
										</div>
										{dispatchMessages[req.id] && (
											<div style={{ 
												marginTop: 8, 
												padding: '4px 8px', 
												borderRadius: '4px', 
												fontSize: '0.75rem',
												backgroundColor: dispatchMessages[req.id].type === 'success' ? '#d1fae5' : '#fee2e2',
												color: dispatchMessages[req.id].type === 'success' ? '#065f46' : '#991b1b'
											}}>
												{dispatchMessages[req.id].message}
											</div>
										)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Notes section for requests with notes */}
			{filteredRequests.some((req) => req.notes) && (
				<div style={{ marginTop: 16 }}>
					<h3 style={{ fontSize: '1rem', margin: '0 0 8px' }}>Request Notes:</h3>
					{filteredRequests
						.filter((req) => req.notes)
						.map((req) => (
							<div key={req.id} style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', marginBottom: '4px' }}>
								<strong>{req.shop_name}</strong> ({getProductDetails(req.product_id).sku}): {req.notes}
							</div>
						))}
				</div>
			)}
		</div>
	);
}

const th: React.CSSProperties = { 
	textAlign: 'left', 
	padding: '10px 8px', 
	borderBottom: '1px solid #ddd',
	fontSize: '0.875rem',
	fontWeight: 600,
};

const td: React.CSSProperties = { 
	padding: '10px 8px', 
	borderBottom: '1px solid #eee', 
	verticalAlign: 'top',
	fontSize: '0.875rem',
};

const actionBtn: React.CSSProperties = {
	padding: '4px 8px',
	border: 'none',
	borderRadius: '4px',
	color: 'white',
	fontSize: '0.75rem',
	cursor: 'pointer',
	fontWeight: 500,
};
