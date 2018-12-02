import React from 'react';
import { ArcherContainer, ArcherElement } from 'react-archer';

const rootStyle = { display: 'flex', justifyContent: 'center' };
const rowStyle = { margin: '200px 0', display: 'flex', justifyContent: 'space-between', };
const boxStyle = { padding: '10px', border: '1px solid black', };

const ArcherTest = () => {
	return (
		<div>

			<ArcherContainer strokeColor='red' >
				<div style={rootStyle}>
					<ArcherElement
						id='root'
						relations={[
							{
								from: { anchor: 'bottom' },
								to: { anchor: 'top', id: 'element2' }
							}
						]}
					>
						<div style={boxStyle}>Root</div>
					</ArcherElement>
				</div>

				<div style={rowStyle}>
					<ArcherElement
						id='element2'
						relations={[
							{
								from: { anchor: 'right' },
								to: { anchor: 'left', id: 'element3' },
								label: <div style={{ marginTop: '-20px' }}>Arrow 2</div>,
							}
						]}
					>
						<div style={boxStyle}>Element 2</div>
					</ArcherElement>

					<ArcherElement id='element3'>
						<div style={boxStyle}>Element 3</div>
					</ArcherElement>

					<ArcherElement
						id='element4'
						relations={[
							{
								from: { anchor: 'left' },

								to: { anchor: 'right', id: 'root' },
								label: 'Arrow 3',
							},
							{
								from: { anchor: 'left' },

								to: { anchor: 'right', id: 'element3' },
							}
						]}
					>
						<div style={boxStyle}>Element 4</div>
					</ArcherElement>
				</div>
			</ArcherContainer>

		</div>
	);
};

export default ArcherTest;
