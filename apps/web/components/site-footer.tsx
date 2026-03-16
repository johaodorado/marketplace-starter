export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-bar" />

      <div className="footer-container">
        <p className="footer-tagline">
          Tecnologia y confianza para ecosistemas acuaticos excepcionales.
        </p>

        <div className="footer-container-datos">
          <div className="footer-direccion">
            <p>Direccion:</p>
            <div className="footer-lines">
              <span>Edificio River Plaza Oficina 603</span>
              <span>Daule, Guayas, EC</span>
              <span>Vergeles MZ84 V36</span>
              <span>Guayaquil, Guayas, EC</span>
            </div>
          </div>

          <div className="footer-telefonos">
            <p>Telefonos:</p>
            <div className="footer-lines">
              <span>(+593) 984580209</span>
              <span>(+593) 999430808</span>
              <span>(+593) 980187097</span>
            </div>
          </div>

          <div className="footer-email">
            <p>Email:</p>
            <div className="footer-lines">
              <span>gerencia@kamilnova.com</span>
              <span>kamilnova03@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="footer-redes-wrap">
          <span className="footer-redes-title">Siguenos</span>
          <div className="footer-redes">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://wa.me/593980187097?text=Hola, necesito informacion."
            >
              <img src="/img/icon/whatsapp.png" alt="WhatsApp" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.instagram.com/artquarium_ec/"
            >
              <img src="/img/icon/instagram.png" alt="Instagram" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.facebook.com/profile.php?id=100083634542952&locale=es_LA"
            >
              <img src="/img/icon/facebook.png" alt="Facebook" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-derechos">
        <p>© Artquarium</p>
      </div>
    </footer>
  )
}
