const valores = [
  {
    nombre: 'Responsabilidad',
    icono: '/img/icon/responsabilidad.png',
  },
  {
    nombre: 'Trabajo en equipo',
    icono: '/img/icon/trabajo-equipo.png',
  },
  {
    nombre: 'Excelencia',
    icono: '/img/icon/excelencia.png',
  },
  {
    nombre: 'Innovacion',
    icono: '/img/icon/innovacion.png',
  },
  {
    nombre: 'Competitividad',
    icono: '/img/icon/competitividad.png',
  },
]

export default function NosotrosPage() {
  return (
    <main className="page about-page">
      <section className="about-card">
        <div className="card-header">
          <span className="card-badge">Mision</span>
        </div>
        <p className="card-text">
          Satisfacer a nuestros clientes con la mayor variedad de productos y
          alimentos de consumo masivo, ofrecer un servicio diferenciado y
          generar, con el mejor talento humano, la rentabilidad esperada en
          beneficio de todos.
        </p>
      </section>

      <section className="about-card">
        <div className="card-header">
          <span className="card-badge">Vision</span>
        </div>
        <p className="card-text">
          Ser una empresa lider de productos de consumo masivo, con un excelente
          nivel de servicio a nuestros clientes y un alto grado de
          responsabilidad social y comercial, para sostener crecimiento
          constante y alcanzar nuevas lineas.
        </p>
      </section>

      <section className="about-card values-card">
        <div className="values-header">
          <h2 className="values-title">Valores</h2>
        </div>

        <div className="values-grid">
          {valores.map((valor) => (
            <article key={valor.nombre} className="value-item">
              <img className="value-icon" src={valor.icono} alt={valor.nombre} />
              <h3 className="value-name">{valor.nombre}</h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
