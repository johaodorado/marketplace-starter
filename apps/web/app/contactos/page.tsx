export default function ContactosPage() {
  return (
    <main className="page">
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-info">
            <h2>Informacion de Contacto</h2>

            <div className="info-item">
              <div>
                <h3>Direccion</h3>
                <p>Edificio River Plaza Oficina 603</p>
                <p>Daule, Guayas, EC</p>
                <p>Vergeles MZ84 V36, Guayaquil</p>
              </div>
            </div>

            <div className="info-item">
              <div>
                <h3>Telefonos</h3>
                <p>(+593) 984580209</p>
                <p>(+593) 999430808</p>
                <p>(+593) 980187097</p>
              </div>
            </div>

            <div className="info-item">
              <div>
                <h3>Email</h3>
                <p>gerencia@kamilnova.com</p>
                <p>kamilnova03@gmail.com</p>
              </div>
            </div>

            <div className="social-links">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://wa.me/593980187097"
                aria-label="WhatsApp"
              >
                <img src="/img/icon/whatsapp.png" alt="WhatsApp" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.instagram.com/artquarium_ec/"
                aria-label="Instagram"
              >
                <img src="/img/icon/instagram.png" alt="Instagram" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.facebook.com/profile.php?id=100083634542952&locale=es_LA"
                aria-label="Facebook"
              >
                <img src="/img/icon/facebook.png" alt="Facebook" />
              </a>
            </div>
          </div>

          <div className="contact-form">
            <h2>Envia un mensaje</h2>
            <form>
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo</label>
                <input id="nombre" type="text" placeholder="Tu nombre" />
              </div>

              <div className="form-group">
                <label htmlFor="correo">Correo electronico</label>
                <input id="correo" type="email" placeholder="correo@ejemplo.com" />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Telefono</label>
                <input id="telefono" type="tel" placeholder="Tu telefono" />
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">Mensaje</label>
                <textarea id="mensaje" rows={4} placeholder="Escribe tu consulta" />
              </div>

              <button type="button" className="btn">
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="map-section">
        <span className="location-badge">Ubicacion Daule</span>
        <p className="location-address">
          Edificio River Plaza Oficina 603 Daule, Guayas Ecuador
        </p>

        <div className="map-container">
          <iframe
            title="Mapa de Kamilnova"
            loading="lazy"
            allowFullScreen
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12397.895670962742!2d-79.912655!3d-2.050751!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d131aabbfce07%3A0xe7d225476b14e50!2sRiver%20Plaza!5e1!3m2!1ses!2sec!4v1771516420763!5m2!1ses!2sec"
          />
        </div>
      </section>
    </main>
  )
}
