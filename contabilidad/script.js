// Datos iniciales
let arqueos = [];
let asientosDiario = [];
let cuentas = [
    { codigo: '1', nombre: 'Caja', tipo: 'Activo' },
    { codigo: '4', nombre: 'Bancos', tipo: 'Activo' },
    { codigo: '5', nombre: 'Clientes', tipo: 'Activo' },
    { codigo: '1.1', nombre: 'Gastos de Administración', tipo: 'Gasto' },
    { codigo: '1.2', nombre: 'Gastos de Ventas', tipo: 'Gasto' },
    { codigo: '3', nombre: 'Inventario', tipo: 'Activo' },
    { codigo: '4.1', nombre: 'Proveedores', tipo: 'Pasivo' },
    { codigo: '5.1', nombre: 'Capital Social', tipo: 'Patrimonio' },
    { codigo: '6', nombre: 'Ventas', tipo: 'Ingreso' },
    { codigo: '7', nombre: 'Costos de Ventas', tipo: 'Gasto' },
    { codigo: '8', nombre: 'Sueldos y Salarios', tipo: 'Gasto' },
    { codigo: '9', nombre: 'Servicios Públicos', tipo: 'Gasto' },
    { codigo: '10', nombre: 'Depreciación', tipo: 'Gasto' }
];

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha-arqueo').value = hoy;
    document.getElementById('fecha-diario').value = hoy;
    document.getElementById('fecha-balanza').value = hoy;
    document.getElementById('fecha-mayor').value = hoy;
    document.getElementById('periodo-resultados').value = hoy.substring(0, 7);
    
    llenarDatalistCuentas();
    generarMayorCompleto();
    configurarEventosCalculos();
});

// Función para cargar datos guardados
function cargarDatos() {
    const datosGuardados = localStorage.getItem('datosContables');
    if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        arqueos = datos.arqueos || [];
        asientosDiario = datos.asientosDiario || [];
        cuentas = datos.cuentas || cuentas;
    }
}

// Función para guardar datos
function guardarDatos() {
    const datos = {
        arqueos,
        asientosDiario,
        cuentas
    };
    localStorage.setItem('datosContables', JSON.stringify(datos));
}

// Función para cambiar entre pestañas
function openTab(tabName) {
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Funciones para el arqueo de caja
function addRow(tableId) {
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    
    if (tableId === 'efectivo-table') {
        newRow.innerHTML = `
            <td>
                <select class="denominacion" onchange="calcularSubtotal(this)">
                    <option value="1000">Billete de $1,000</option>
                    <option value="500">Billete de $500</option>
                    <option value="200">Billete de $200</option>
                    <option value="100">Billete de $100</option>
                    <option value="50">Billete de $50</option>
                    <option value="20">Billete de $20</option>
                    <option value="10">Moneda de $10</option>
                    <option value="5">Moneda de $5</option>
                    <option value="2">Moneda de $2</option>
                    <option value="1">Moneda de $1</option>
                    <option value="0.5">Moneda de $0.50</option>
                </select>
            </td>
            <td><input type="number" class="cantidad" min="0" placeholder="0" oninput="calcularSubtotal(this)"></td>
            <td class="subtotal">$0.00</td>
            <td><button class="delete-btn" onclick="deleteRow(this)">✕</button></td>
        `;
    } else {
        newRow.innerHTML = `
            <td><input type="text" class="concepto" placeholder="Concepto"></td>
            <td><input type="number" class="monto" placeholder="0.00" oninput="calcularTotalesArqueo()"></td>
            <td><button class="delete-btn" onclick="deleteRow(this)">✕</button></td>
        `;
    }
}

function calcularSubtotal(input) {
    const row = input.closest('tr');
    const denominacion = parseFloat(row.querySelector('.denominacion').value);
    const cantidad = parseInt(row.querySelector('.cantidad').value) || 0;
    const subtotal = denominacion * cantidad;
    
    row.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
    calcularTotalesArqueo();
}

function deleteRow(btn) {
    const row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
    
    if (btn.closest('#efectivo-table')) {
        calcularTotalesArqueo();
    } else if (btn.closest('#ingresos-table, #egresos-table')) {
        calcularTotalesArqueo();
    } else if (btn.closest('#diario-table')) {
        calcularTotalesDiario();
    }
}

function calcularTotalesArqueo() {
    let totalEfectivo = 0;
    document.querySelectorAll('#efectivo-table tbody tr').forEach(row => {
        const subtotalText = row.querySelector('.subtotal').textContent.replace('$', '');
        totalEfectivo += parseFloat(subtotalText) || 0;
    });
    document.getElementById('total-efectivo').textContent = `$${totalEfectivo.toFixed(2)}`;
    
    let totalIngresos = 0;
    document.querySelectorAll('#ingresos-table tbody tr').forEach(row => {
        const monto = parseFloat(row.querySelector('.monto').value) || 0;
        totalIngresos += monto;
    });
    document.getElementById('total-ingresos').textContent = `$${totalIngresos.toFixed(2)}`;
    
    let totalEgresos = 0;
    document.querySelectorAll('#egresos-table tbody tr').forEach(row => {
        const monto = parseFloat(row.querySelector('.monto').value) || 0;
        totalEgresos += monto;
    });
    document.getElementById('total-egresos').textContent = `$${totalEgresos.toFixed(2)}`;
    
    const totalMovimientos = totalIngresos - totalEgresos;
    document.getElementById('total-movimientos').textContent = `$${totalMovimientos.toFixed(2)}`;
    
    const diferencia = totalEfectivo - totalMovimientos;
    const diferenciaElement = document.getElementById('diferencia-arqueo');
    diferenciaElement.textContent = `$${Math.abs(diferencia).toFixed(2)}`;
    
    if (diferencia !== 0) {
        diferenciaElement.style.color = '#e74c3c';
        diferenciaElement.innerHTML += ` <span style="font-style:italic">(${diferencia > 0 ? 'Sobrante' : 'Faltante'})</span>`;
    } else {
        diferenciaElement.style.color = '#2ecc71';
    }
}

function guardarArqueo() {
    const fecha = document.getElementById('fecha-arqueo').value;
    const efectivo = [];
    const ingresos = [];
    const egresos = [];
    
    document.querySelectorAll('#efectivo-table tbody tr').forEach(row => {
        const denominacion = row.querySelector('.denominacion').value;
        const cantidad = parseInt(row.querySelector('.cantidad').value) || 0;
        if (cantidad > 0) {
            efectivo.push({
                denominacion: parseFloat(denominacion),
                cantidad,
                subtotal: parseFloat(row.querySelector('.subtotal').textContent.replace('$', ''))
            });
        }
    });
    
    document.querySelectorAll('#ingresos-table tbody tr').forEach(row => {
        const concepto = row.querySelector('.concepto').value;
        const monto = parseFloat(row.querySelector('.monto').value) || 0;
        if (concepto && monto > 0) {
            ingresos.push({ concepto, monto });
        }
    });
    
    document.querySelectorAll('#egresos-table tbody tr').forEach(row => {
        const concepto = row.querySelector('.concepto').value;
        const monto = parseFloat(row.querySelector('.monto').value) || 0;
        if (concepto && monto > 0) {
            egresos.push({ concepto, monto });
        }
    });
    
    if (efectivo.length === 0 && ingresos.length === 0 && egresos.length === 0) {
        alert('Debe ingresar al menos un movimiento o denominación de efectivo');
        return;
    }
    
    const arqueo = {
        fecha,
        efectivo,
        ingresos,
        egresos,
        totalEfectivo: parseFloat(document.getElementById('total-efectivo').textContent.replace('$', '')),
        totalIngresos: parseFloat(document.getElementById('total-ingresos').textContent.replace('$', '')),
        totalEgresos: parseFloat(document.getElementById('total-egresos').textContent.replace('$', '')),
        diferencia: parseFloat(document.getElementById('diferencia-arqueo').textContent.replace('$', ''))
    };
    
    arqueos.push(arqueo);
    guardarDatos();
    
    alert('Arqueo de caja guardado correctamente');
    crearAsientoArqueo(arqueo);
}

function crearAsientoArqueo(arqueo) {
    const asiento = {
        fecha: arqueo.fecha,
        descripcion: 'Arqueo de caja del ' + arqueo.fecha,
        partidas: []
    };
    
    if (arqueo.totalIngresos > 0) {
        asiento.partidas.push({
            cuenta: 'Caja',
            debe: arqueo.totalIngresos,
            haber: 0,
            concepto: 'Ingresos de caja'
        });
        
        asiento.partidas.push({
            cuenta: 'Ventas',
            debe: 0,
            haber: arqueo.totalIngresos,
            concepto: 'Ingresos de caja'
        });
    }
    
    if (arqueo.totalEgresos > 0) {
        asiento.partidas.push({
            cuenta: 'Gastos de Administración',
            debe: arqueo.totalEgresos,
            haber: 0,
            concepto: 'Egresos de caja'
        });
        
        asiento.partidas.push({
            cuenta: 'Caja',
            debe: 0,
            haber: arqueo.totalEgresos,
            concepto: 'Egresos de caja'
        });
    }
    
    asientosDiario.push(asiento);
    guardarDatos();
}

// Funciones para el libro diario
function addRowDiario() {
    const table = document.getElementById('diario-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    
    newRow.innerHTML = `
        <td>
            <input type="text" class="cuenta" placeholder="Cuenta" list="cuentas-list">
        </td>
        <td><input type="number" class="debe" placeholder="0.00" oninput="calcularTotalesDiario()"></td>
        <td><input type="number" class="haber" placeholder="0.00" oninput="calcularTotalesDiario()"></td>
        <td><input type="text" class="concepto" placeholder="Concepto"></td>
        <td><button class="delete-btn" onclick="deleteRow(this)">✕</button></td>
    `;
}

function llenarDatalistCuentas() {
    const datalist = document.getElementById('cuentas-list');
    datalist.innerHTML = '';
    
    cuentas.forEach(cuenta => {
        const option = document.createElement('option');
        option.value = cuenta.nombre;
        datalist.appendChild(option);
    });
}

function calcularTotalesDiario() {
    let totalDebe = 0;
    let totalHaber = 0;
    
    document.querySelectorAll('#diario-table tbody tr').forEach(row => {
        const debe = parseFloat(row.querySelector('.debe').value) || 0;
        const haber = parseFloat(row.querySelector('.haber').value) || 0;
        
        totalDebe += debe;
        totalHaber += haber;
    });
    
    document.getElementById('total-debe').textContent = totalDebe.toFixed(2);
    document.getElementById('total-haber').textContent = totalHaber.toFixed(2);
    
    const diferencia = totalDebe - totalHaber;
    document.getElementById('diferencia-diario').textContent = Math.abs(diferencia).toFixed(2);
    
    if (diferencia !== 0) {
        document.querySelector('.diferencia').style.color = '#e74c3c';
    } else {
        document.querySelector('.diferencia').style.color = '#2ecc71';
    }
}

function guardarDiario() {
    const fecha = document.getElementById('fecha-diario').value;
    const partidas = [];
    let descripcion = '';
    
    const totalDebe = parseFloat(document.getElementById('total-debe').textContent);
    const totalHaber = parseFloat(document.getElementById('total-haber').textContent);
    
    if (totalDebe !== totalHaber) {
        alert('El asiento no está balanceado. Debe y Haber deben ser iguales.');
        return;
    }
    
    document.querySelectorAll('#diario-table tbody tr').forEach((row, index) => {
        const cuenta = row.querySelector('.cuenta').value;
        const debe = parseFloat(row.querySelector('.debe').value) || 0;
        const haber = parseFloat(row.querySelector('.haber').value) || 0;
        const concepto = row.querySelector('.concepto').value;
        
        if (cuenta && (debe > 0 || haber > 0)) {
            partidas.push({ cuenta, debe, haber, concepto });
            
            if (index === 0) {
                descripcion = concepto;
            }
        }
    });
    
    if (partidas.length < 2) {
        alert('Debe ingresar al menos dos partidas para un asiento contable');
        return;
    }
    
    const asiento = {
        fecha,
        descripcion,
        partidas
    };
    
    asientosDiario.push(asiento);
    guardarDatos();
    
    alert('Asiento contable guardado correctamente');
    
    document.getElementById('diario-table').getElementsByTagName('tbody')[0].innerHTML = '';
    addRowDiario();
    addRowDiario();
    calcularTotalesDiario();
}

// Funciones para el libro mayor
function generarMayorCompleto() {
    const fechaCorte = document.getElementById('fecha-mayor').value;
    const container = document.getElementById('mayor-completo-container');
    container.innerHTML = '<div class="loading">Cargando cuentas...</div>';
    
    setTimeout(() => {
        container.innerHTML = '';
        const cuentasConMovimientos = obtenerCuentasConMovimientos(fechaCorte);
        
        if (cuentasConMovimientos.length === 0) {
            container.innerHTML = '<div class="no-data">No hay movimientos para mostrar</div>';
            return;
        }
        
        cuentasConMovimientos.forEach(cuenta => {
            const cuentaDiv = document.createElement('div');
            cuentaDiv.className = 'cuenta-mayor-item';
            
            cuentaDiv.innerHTML = `
                <div class="cuenta-mayor-header">${cuenta.nombre}</div>
                <div class="t-account-small">
                    <div class="debe-column-small">
                        <h5>DEBE</h5>
                        <div class="entries-small" id="debe-${cuenta.nombre.replace(/\s+/g, '-')}"></div>
                        <div class="total-t-small">
                            <strong>Total:</strong> <span id="total-debe-${cuenta.nombre.replace(/\s+/g, '-')}">0.00</span>
                        </div>
                    </div>
                    <div class="haber-column-small">
                        <h5>HABER</h5>
                        <div class="entries-small" id="haber-${cuenta.nombre.replace(/\s+/g, '-')}"></div>
                        <div class="total-t-small">
                            <strong>Total:</strong> <span id="total-haber-${cuenta.nombre.replace(/\s+/g, '-')}">0.00</span>
                        </div>
                    </div>
                </div>
                <div class="saldo-cuenta-small">
                    <strong>Saldo:</strong> <span id="saldo-${cuenta.nombre.replace(/\s+/g, '-')}">0.00</span>
                    (<span id="tipo-saldo-${cuenta.nombre.replace(/\s+/g, '-')}">Deudor</span>)
                </div>
            `;
            
            container.appendChild(cuentaDiv);
            llenarMovimientosCuenta(cuenta.nombre, fechaCorte);
        });
    }, 100);
}

function obtenerCuentasConMovimientos(fechaCorte) {
    const cuentasConMovimientos = new Set();
    
    asientosDiario.forEach(asiento => {
        if (fechaCorte && asiento.fecha > fechaCorte) return;
        
        asiento.partidas.forEach(partida => {
            cuentasConMovimientos.add(partida.cuenta);
        });
    });
    
    return Array.from(cuentasConMovimientos).map(nombre => {
        const cuentaInfo = cuentas.find(c => c.nombre === nombre);
        return {
            nombre,
            tipo: cuentaInfo ? cuentaInfo.tipo : 'No definido'
        };
    });
}

function llenarMovimientosCuenta(cuentaNombre, fechaCorte) {
    const safeNombre = cuentaNombre.replace(/\s+/g, '-');
    const debeDiv = document.getElementById(`debe-${safeNombre}`);
    const haberDiv = document.getElementById(`haber-${safeNombre}`);
    
    debeDiv.innerHTML = '';
    haberDiv.innerHTML = '';
    
    let totalDebe = 0;
    let totalHaber = 0;
    
    asientosDiario.forEach(asiento => {
        if (fechaCorte && asiento.fecha > fechaCorte) return;
        
        asiento.partidas.forEach(partida => {
            if (partida.cuenta === cuentaNombre) {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'entry-small';
                
                if (partida.debe > 0) {
                    entryDiv.innerHTML = `
                        <span>${asiento.fecha}</span>
                        <span>${partida.debe.toFixed(2)}</span>
                    `;
                    debeDiv.appendChild(entryDiv);
                    totalDebe += partida.debe;
                } else if (partida.haber > 0) {
                    entryDiv.innerHTML = `
                        <span>${asiento.fecha}</span>
                        <span>${partida.haber.toFixed(2)}</span>
                    `;
                    haberDiv.appendChild(entryDiv);
                    totalHaber += partida.haber;
                }
            }
        });
    });
    
    document.getElementById(`total-debe-${safeNombre}`).textContent = totalDebe.toFixed(2);
    document.getElementById(`total-haber-${safeNombre}`).textContent = totalHaber.toFixed(2);
    
    const saldo = totalDebe - totalHaber;
    document.getElementById(`saldo-${safeNombre}`).textContent = Math.abs(saldo).toFixed(2);
    
    if (saldo > 0) {
        document.getElementById(`tipo-saldo-${safeNombre}`).textContent = 'Deudor';
    } else if (saldo < 0) {
        document.getElementById(`tipo-saldo-${safeNombre}`).textContent = 'Acreedor';
    } else {
        document.getElementById(`tipo-saldo-${safeNombre}`).textContent = 'Saldo cero';
    }
}

// Funciones para la balanza de comprobación
function generarBalanza() {
    const fecha = document.getElementById('fecha-balanza').value;
    if (!fecha) {
        alert('Seleccione una fecha para generar la balanza');
        return;
    }
    
    const tabla = document.getElementById('balanza-table').getElementsByTagName('tbody')[0];
    tabla.innerHTML = '<tr><td colspan="5" class="loading">Cargando datos...</td></tr>';
    
    setTimeout(() => {
        tabla.innerHTML = '';
        const saldos = {};
        
        asientosDiario.forEach(asiento => {
            if (asiento.fecha > fecha) return;
            
            asiento.partidas.forEach(partida => {
                if (!saldos[partida.cuenta]) {
                    saldos[partida.cuenta] = { debe: 0, haber: 0 };
                }
                saldos[partida.cuenta].debe += partida.debe;
                saldos[partida.cuenta].haber += partida.haber;
            });
        });
        
        if (Object.keys(saldos).length === 0) {
            tabla.innerHTML = '<tr><td colspan="5" class="no-data">No hay movimientos para esta fecha</td></tr>';
            return;
        }
        
        let totalDebe = 0;
        let totalHaber = 0;
        let totalSaldoDeudor = 0;
        let totalSaldoAcreedor = 0;
        
        const cuentasOrdenadas = Object.keys(saldos).sort((a, b) => {
            const cuentaA = cuentas.find(c => c.nombre === a) || { codigo: '999' };
            const cuentaB = cuentas.find(c => c.nombre === b) || { codigo: '999' };
            return cuentaA.codigo.localeCompare(cuentaB.codigo);
        });
        
        cuentasOrdenadas.forEach(cuenta => {
            const debe = saldos[cuenta].debe;
            const haber = saldos[cuenta].haber;
            const saldo = debe - haber;
            
            totalDebe += debe;
            totalHaber += haber;
            
            const row = tabla.insertRow();
            row.innerHTML = `
                <td>${cuenta}</td>
                <td class="number">${debe.toFixed(2)}</td>
                <td class="number">${haber.toFixed(2)}</td>
                <td class="number">${saldo > 0 ? saldo.toFixed(2) : ''}</td>
                <td class="number">${saldo < 0 ? Math.abs(saldo).toFixed(2) : ''}</td>
            `;
            
            if (saldo > 0) totalSaldoDeudor += saldo;
            if (saldo < 0) totalSaldoAcreedor += Math.abs(saldo);
        });
        
        document.getElementById('total-balanza-debe').textContent = totalDebe.toFixed(2);
        document.getElementById('total-balanza-haber').textContent = totalHaber.toFixed(2);
        document.getElementById('total-saldo-deudor').textContent = totalSaldoDeudor.toFixed(2);
        document.getElementById('total-saldo-acreedor').textContent = totalSaldoAcreedor.toFixed(2);
    }, 100);
}

// Función para generar estado de resultados con ISR
function generarEstadoResultados() {
    const periodo = document.getElementById('periodo-resultados').value;
    const tasaISR = parseFloat(document.getElementById('tasa-isr').value) || 30;
    
    if (!periodo) {
        alert('Seleccione un período para generar el estado de resultados');
        return;
    }
    
    const ingresosDiv = document.getElementById('ingresos-resultados');
    const gastosDiv = document.getElementById('gastos-resultados');
    const isrDiv = document.getElementById('isr-calculo');
    
    ingresosDiv.innerHTML = '<div class="loading">Cargando ingresos...</div>';
    gastosDiv.innerHTML = '<div class="loading">Cargando gastos...</div>';
    isrDiv.innerHTML = '';
    
    setTimeout(() => {
        const ingresos = {};
        const gastos = {};
        
        asientosDiario.forEach(asiento => {
            const asientoAnioMes = asiento.fecha.substring(0, 7);
            if (asientoAnioMes !== periodo) return;
            
            asiento.partidas.forEach(partida => {
                const cuentaInfo = cuentas.find(c => c.nombre === partida.cuenta) || {};
                
                if (cuentaInfo.tipo === 'Ingreso') {
                    if (!ingresos[partida.cuenta]) ingresos[partida.cuenta] = 0;
                    ingresos[partida.cuenta] += (partida.haber - partida.debe);
                } 
                else if (cuentaInfo.tipo === 'Gasto') {
                    if (!gastos[partida.cuenta]) gastos[partida.cuenta] = 0;
                    gastos[partida.cuenta] += (partida.debe - partida.haber);
                }
            });
        });
        
        // Procesar ingresos
        ingresosDiv.innerHTML = '';
        let totalIngresos = 0;
        
        Object.keys(ingresos)
            .filter(cuenta => ingresos[cuenta] > 0)
            .sort()
            .forEach(cuenta => {
                const monto = ingresos[cuenta];
                totalIngresos += monto;
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'resultado-item';
                itemDiv.innerHTML = `
                    <span>${cuenta}</span>
                    <span class="number">${monto.toFixed(2)}</span>
                `;
                ingresosDiv.appendChild(itemDiv);
            });
        
        document.getElementById('total-ingresos-resultados').textContent = totalIngresos.toFixed(2);
        
        // Procesar gastos
        gastosDiv.innerHTML = '';
        let totalGastos = 0;
        
        Object.keys(gastos)
            .filter(cuenta => gastos[cuenta] > 0)
            .sort()
            .forEach(cuenta => {
                const monto = gastos[cuenta];
                totalGastos += monto;
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'resultado-item';
                itemDiv.innerHTML = `
                    <span>${cuenta}</span>
                    <span class="number">${monto.toFixed(2)}</span>
                `;
                gastosDiv.appendChild(itemDiv);
            });
        
        document.getElementById('total-gastos-resultados').textContent = totalGastos.toFixed(2);
        
        // Calcular resultado operativo
        const resultadoOperativo = totalIngresos - totalGastos;
        document.getElementById('resultado-operativo').textContent = resultadoOperativo.toFixed(2);
        
        // Calcular ISR solo si hay utilidad
        let isr = 0;
        if (resultadoOperativo > 0) {
            isr = resultadoOperativo * (tasaISR / 100);
            
            const isrItem = document.createElement('div');
            isrItem.className = 'isr-item';
            isrItem.innerHTML = `
                <span>ISR (${tasaISR}% sobre $${resultadoOperativo.toFixed(2)})</span>
                <span class="number">${isr.toFixed(2)}</span>
            `;
            isrDiv.appendChild(isrItem);
        } else {
            isrDiv.innerHTML = '<div class="no-data">No aplica ISR (no hay utilidad)</div>';
        }
        
        document.getElementById('total-isr').textContent = isr.toFixed(2);
        
        // Calcular resultado neto
        const resultadoNeto = resultadoOperativo - isr;
        const resultadoElement = document.getElementById('utilidad-perdida');
        resultadoElement.textContent = Math.abs(resultadoNeto).toFixed(2);
        
        if (resultadoNeto >= 0) {
            document.getElementById('tipo-resultado').textContent = 'Utilidad Neta';
            resultadoElement.style.color = '#2ecc71';
        } else {
            document.getElementById('tipo-resultado').textContent = 'Pérdida Neta';
            resultadoElement.style.color = '#e74c3c';
        }
    }, 100);
}

// Configurar eventos para cálculos automáticos
function configurarEventosCalculos() {
    document.querySelectorAll('#ingresos-table .monto, #egresos-table .monto').forEach(input => {
        input.addEventListener('input', calcularTotalesArqueo);
    });
    
    document.querySelectorAll('#diario-table .debe, #diario-table .haber').forEach(input => {
        input.addEventListener('input', calcularTotalesDiario);
    });
}
// Función para confirmar el borrado de datos
function confirmarBorrado() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    const confirmacion = document.createElement('div');
    confirmacion.className = 'confirmacion-borrado';
    confirmacion.innerHTML = `
        <h3>¿Está seguro que desea borrar todos los datos?</h3>
        <p>Esta acción no se puede deshacer y eliminará toda la información contable almacenada.</p>
        <button class="danger-btn" onclick="borrarTodosLosDatos()">Sí, Borrar Todo</button>
        <button class="save-btn" onclick="cancelarBorrado()">Cancelar</button>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(confirmacion);
}

// Función para borrar todos los datos
function borrarTodosLosDatos() {
    // Limpiar datos en memoria
    arqueos = [];
    asientosDiario = [];
    
    // Limpiar localStorage
    localStorage.removeItem('datosContables');
    
    // Limpiar formularios
    document.getElementById('efectivo-table').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('ingresos-table').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('egresos-table').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('diario-table').getElementsByTagName('tbody')[0].innerHTML = '';
    
    // Agregar filas vacías iniciales
    addRow('efectivo-table');
    addRow('ingresos-table');
    addRow('egresos-table');
    addRowDiario();
    addRowDiario();
    
    // Limpiar resultados
    document.getElementById('mayor-completo-container').innerHTML = '';
    document.getElementById('balanza-table').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('ingresos-resultados').innerHTML = '';
    document.getElementById('gastos-resultados').innerHTML = '';
    document.getElementById('isr-calculo').innerHTML = '';
    
    // Restablecer fechas
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha-arqueo').value = hoy;
    document.getElementById('fecha-diario').value = hoy;
    document.getElementById('fecha-balanza').value = hoy;
    document.getElementById('fecha-mayor').value = hoy;
    document.getElementById('periodo-resultados').value = hoy.substring(0, 7);
    
    // Cerrar diálogo de confirmación
    cancelarBorrado();
    
    alert('Todos los datos han sido borrados correctamente');
}

// Función para cancelar el borrado
function cancelarBorrado() {
    document.querySelector('.overlay').remove();
    document.querySelector('.confirmacion-borrado').remove();
}

// Modificar la función guardarDatos para que también guarde las cuentas
function guardarDatos() {
    const datos = {
        arqueos,
        asientosDiario,
        cuentas // Ahora también guardamos las cuentas
    };
    localStorage.setItem('datosContables', JSON.stringify(datos));
}

// Modificar la función cargarDatos para mantener las cuentas
function cargarDatos() {
    const datosGuardados = localStorage.getItem('datosContables');
    if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        arqueos = datos.arqueos || [];
        asientosDiario = datos.asientosDiario || [];
        // Mantenemos las cuentas originales si no hay cuentas guardadas
        cuentas = datos.cuentas || [
            { codigo: '1', nombre: 'Caja', tipo: 'Activo' },
            { codigo: '4', nombre: 'Bancos', tipo: 'Activo' },
            { codigo: '5', nombre: 'Clientes', tipo: 'Activo' },
            { codigo: '1.1', nombre: 'Gastos de Administración', tipo: 'Gasto' },
            { codigo: '1.2', nombre: 'Gastos de Ventas', tipo: 'Gasto' },
            { codigo: '3', nombre: 'Inventario', tipo: 'Activo' },
            { codigo: '4.1', nombre: 'Proveedores', tipo: 'Pasivo' },
            { codigo: '5.1', nombre: 'Capital Social', tipo: 'Patrimonio' },
            { codigo: '6', nombre: 'Ventas', tipo: 'Ingreso' },
            { codigo: '7', nombre: 'Costos de Ventas', tipo: 'Gasto' },
            { codigo: '8', nombre: 'Sueldos y Salarios', tipo: 'Gasto' },
            { codigo: '9', nombre: 'Servicios Públicos', tipo: 'Gasto' },
            { codigo: '10', nombre: 'Depreciación', tipo: 'Gasto' }
        ];
    }
}