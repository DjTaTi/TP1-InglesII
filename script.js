// script.js
// Aquí se agregarán los ejercicios y la lógica de exportación a PDF

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('exportarPDF').addEventListener('click', exportarPDF);
});

function exportarPDF() {
    // Validar campos obligatorios
    let valid = true;

    // Validar apellido y nombre
    const apellidoInput = document.getElementById('apellido');
    const nombreInput = document.getElementById('nombre');
    const apellido = apellidoInput.value.trim();
    const nombre = nombreInput.value.trim();
    if (!apellido) {
        apellidoInput.style.border = '2px solid red';
        valid = false;
    } else {
        apellidoInput.style.border = '';
    }
    if (!nombre) {
        nombreInput.style.border = '2px solid red';
        valid = false;
    } else {
        nombreInput.style.border = '';
    }

    // Validar todos los textareas, excepto los de corrección en punto 5 si no corresponde
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(area => {
        // Si es un campo de corrección del punto 5
        if (area.name && area.name.startsWith('e5c')) {
            // Buscar el radio correspondiente (True/False)
            const num = area.name.replace('e5c', '');
            const radioFalse = document.querySelector(`input[type="radio"][name="e5p${num}"][value="False"]`);
            const radioTrue = document.querySelector(`input[type="radio"][name="e5p${num}"][value="True"]`);
            if (radioFalse && radioFalse.checked) {
                // Solo es obligatorio si la respuesta es False
                if (!area.value.trim()) {
                    area.style.border = '2px solid red';
                    valid = false;
                } else {
                    area.style.border = '';
                }
            } else {
                // No es obligatorio si no está marcado False
                area.style.border = '';
            }
        } else {
            // Para el resto de los textareas
            if (!area.value.trim()) {
                area.style.border = '2px solid red';
                valid = false;
            } else {
                area.style.border = '';
            }
        }
    });

    // Validar checkboxes (al menos uno por grupo)
    const checkboxGroups = [
        ...new Set(Array.from(document.querySelectorAll('input[type="checkbox"]')).map(cb => cb.name))
    ];
    checkboxGroups.forEach(name => {
        const group = document.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
        const checked = Array.from(group).some(cb => cb.checked);
        group.forEach(cb => {
            if (!checked) {
                cb.parentElement.style.color = 'red';
                valid = false;
            } else {
                cb.parentElement.style.color = '';
            }
        });
    });

    // Validar radios (al menos uno por grupo)
    const radioNames = [
        ...new Set(Array.from(document.querySelectorAll('input[type="radio"]')).map(r => r.name))
    ];
    radioNames.forEach(name => {
        const group = document.querySelectorAll(`input[type="radio"][name="${name}"]`);
        const checked = Array.from(group).some(r => r.checked);
        group.forEach(r => {
            if (!checked) {
                r.parentElement.style.color = 'red';
                valid = false;
            } else {
                r.parentElement.style.color = '';
            }
        });
    });

    if (!valid) {
        alert('Por favor, completa todas las consignas obligatorias. Los campos faltantes están marcados en rojo.');
        return;
    }

    // Asignar fecha actual si el campo está vacío
    const fechaInput = document.getElementById('fecha');
    let fecha = fechaInput.value;
    if (!fecha) {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        fecha = `${yyyy}-${mm}-${dd}`;
        fechaInput.value = fecha;
    }


    // Crear encabezado institucional
    const datosAlumno = document.createElement('div');
    datosAlumno.style.marginBottom = '1.5em';
    datosAlumno.style.fontSize = '1.1em';
    datosAlumno.style.textAlign = 'left';
    datosAlumno.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1.5em; margin-bottom: 1em;">
            <img src='logo-utn-siglas.png' alt='Logo UTN' style='height:60px;'>
            <div>
                <div><strong>Universidad Tecnológica Nacional</strong></div>
                <div>Facultad Regional La Plata</div>
                <div>Materia: Inglés II</div>
                <div>TUP 21</div>
                <div>Profesora: Claudia Pellegrini</div>
                <div>Trabajo Práctico N° 1</div>
            </div>
        </div>
        <div><strong>Alumno:</strong> ${apellido}, ${nombre}</div>
        <div><strong>Fecha:</strong> ${fecha}</div>
        <hr style="margin:1em 0;">
    `;

    // Clonar el contenido principal
    const main = document.querySelector('main');
    const clone = main.cloneNode(true);

    // Copiar valores de los campos al clon
    // Textareas: reemplazar por div con el texto ingresado
    const textareasOriginal = main.querySelectorAll('textarea');
    const textareasClon = clone.querySelectorAll('textarea');
    textareasOriginal.forEach((area, i) => {
        // En el Punto 5, si no se marcó "False", el textarea está oculto y no debe salir en el PDF
        if (area.style.display === 'none') {
            textareasClon[i].parentNode.removeChild(textareasClon[i]);
            return;
        }

        const valor = area.value;
        const divRespuesta = document.createElement('div');
        divRespuesta.className = 'respuesta-texto';
        divRespuesta.style.margin = '0.5em 0 1em 0';
        divRespuesta.textContent = valor;
        textareasClon[i].parentNode.replaceChild(divRespuesta, textareasClon[i]);
    });
    // Reemplazar checkboxes por texto [✓] o [ ] según corresponda
    const checksOriginal = main.querySelectorAll('input[type="checkbox"]');
    const checksClon = clone.querySelectorAll('input[type="checkbox"]');
    checksOriginal.forEach((cb, i) => {
        const labelClone = checksClon[i].parentNode;
        const mark = cb.checked ? '☑' : '☐'; // Usar símbolos Unicode para mejor visualización
        const span = document.createElement('span');
        span.innerHTML = `${mark} ${cb.value}`;
        span.style.paddingLeft = '5px';
        labelClone.parentNode.replaceChild(span, labelClone);
    });

    // Reemplazar radios por su valor, subrayando el seleccionado en Azul UTN
    const radiosOriginal = main.querySelectorAll('input[type="radio"]');
    const radiosClon = clone.querySelectorAll('input[type="radio"]');
    radiosOriginal.forEach((rb, i) => {
        const labelClone = radiosClon[i].parentNode;
        const span = document.createElement('span');
        span.textContent = rb.value;
        span.style.padding = '0 5px';
        if (rb.checked) {
            span.style.textDecoration = 'underline';
            span.style.textDecorationColor = '#003366';
            span.style.textDecorationThickness = '2px';
            span.style.color = '#003366';
            span.style.fontWeight = 'bold';
        }
        labelClone.parentNode.replaceChild(span, labelClone);
    });
    // Inputs tipo text (no alumno)
    const textsOriginal = main.querySelectorAll('input[type="text"]');
    const textsClon = clone.querySelectorAll('input[type="text"]');
    textsOriginal.forEach((tx, i) => {
        textsClon[i].value = tx.value;
        textsClon[i].setAttribute('value', tx.value);
    });

    // Crear contenedor temporal
    const contenedor = document.createElement('div');
    contenedor.appendChild(datosAlumno);
    contenedor.appendChild(clone);
    // Pie de página institucional
    const pie = document.createElement('div');
    pie.style.marginTop = '2em';
    pie.style.textAlign = 'center';
    pie.style.fontSize = '0.95em';
    pie.innerHTML = 'Trabajo Práctico presentado para Inglés II - UTN FRLP';
    contenedor.appendChild(pie);

    // Intentar imprimir directamente para evitar errores de seguridad con archivos locales
    const printWindow = window.open('', '_blank');
    const fileName = `TP1_Ingles_II_${apellido}_${nombre}`.replace(/\s+/g, '_');
    printWindow.document.write(`
        <html>
            <head>
                <title>${fileName}</title>
                <link rel="stylesheet" href="styles.css">
                <style>
                    body { padding: 20px; background: white; font-family: Arial, sans-serif; }
                    main { box-shadow: none; margin: 0; padding: 0; max-width: 100%; }
                    .floating-video-btn { display: none !important; }
                    button { display: none !important; }
                    .checkbox-list { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
                    .respuesta-texto { 
                        font-weight: bold; 
                        font-style: italic; 
                        color: #003366; 
                        margin: 5px 0 15px 15px;
                        padding: 5px 10px;
                        border-left: 3px solid #003366;
                        background: #f8faff;
                    }
                </style>
            </head>
            <body>
                ${contenedor.innerHTML}
                <script>
                    window.onload = function() {
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    };
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}
