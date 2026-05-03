import React, { useState, useEffect } from 'react';

export function Stars({ value, size = 14 }) {
  const full = Math.round(value || 0);
  const arr = [1, 2, 3, 4, 5];
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`Note ${value ? value.toFixed(1) : 'non noté'} sur 5`}>
      {arr.map((i) => (
        <span key={i} className={i <= full ? '' : 'empty'}>★</span>
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const cur = hover || value || 0;
  return (
    <span className="rate-row" role="radiogroup" aria-label="Votre note">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          className={i <= cur ? 'on' : ''}
          onMouseEnter={() => !disabled && setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !disabled && onChange(i)}
          disabled={disabled}
          title={`${i} étoile${i > 1 ? 's' : ''}`}
        >★</button>
      ))}
    </span>
  );
}

export function CategoryPill({ children }) {
  return <span className="cat-pill">{children}</span>;
}

export function Pager({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;
  return (
    <nav className="pager" aria-label="Pagination">
      <button className="small" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Précédent</button>
      <span className="info">Page {page} / {pageCount}</span>
      <button className="small" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>Suivant →</button>
    </nav>
  );
}

export function SiteHeader({ route, navigate, currentUser, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [route.name]);

  const isActive = (r) => route.name === r ? 'active' : '';
  const isAdminActive = ['admin', 'admin-recipes', 'admin-users', 'admin-comments'].includes(route.name) ? 'active' : '';

  function NavLinks({ onClick }) {
    return (
      <>
        <a href="#/" className={isActive('home')} onClick={(e) => { e.preventDefault(); navigate('/'); onClick && onClick(); }}>Accueil</a>
        <a href="#/recettes" className={isActive('list')} onClick={(e) => { e.preventDefault(); navigate('/recettes'); onClick && onClick(); }}>Recettes</a>
        {currentUser && (
          <a href="#/proposer" className={isActive('submit')} onClick={(e) => { e.preventDefault(); navigate('/proposer'); onClick && onClick(); }}>Proposer</a>
        )}
        <a href="#/about" className={isActive('about')} onClick={(e) => { e.preventDefault(); navigate('/about'); onClick && onClick(); }}>À propos</a>
        <a href="#/contact" className={isActive('contact')} onClick={(e) => { e.preventDefault(); navigate('/contact'); onClick && onClick(); }}>Contact</a>
        {currentUser && (
          <a href="#/profil" className={isActive('profile')} onClick={(e) => { e.preventDefault(); navigate('/profil'); onClick && onClick(); }}>Profil</a>
        )}
        {currentUser && currentUser.role === 'admin' && (
          <a href="#/admin" className={isAdminActive} onClick={(e) => { e.preventDefault(); navigate('/admin'); onClick && onClick(); }}>Admin</a>
        )}
      </>
    );
  }

  function close() { setMenuOpen(false); }

  return (
    <header className="site-header">
      <div className="shell row">
        <a href="#/" className="brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <span className="dot" aria-hidden="true"></span>
          Recette &amp; Avis
        </a>
        <nav className="primary" aria-label="Navigation principale">
          <NavLinks />
        </nav>
        <div className="user-area">
          {currentUser ? (
            <>
              <span className="who">{currentUser.nom}</span>
              {currentUser.role === 'admin' && <span className="role-badge admin">admin</span>}
              <button className="ghost small" onClick={onLogout}>Déconnexion</button>
            </>
          ) : (
            <>
              <button className="ghost small" onClick={() => navigate('/connexion')}>Connexion</button>
              <button className="primary small" onClick={() => navigate('/inscription')}>Inscription</button>
            </>
          )}
        </div>
        <button
          className={'hamburger' + (menuOpen ? ' open' : '')}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
      {menuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Navigation mobile">
          <NavLinks onClick={close} />
          <div className="mobile-nav-user">
            {currentUser ? (
              <>
                <span className="who">{currentUser.nom}</span>
                {currentUser.role === 'admin' && <span className="role-badge admin">admin</span>}
                <button className="ghost small" onClick={() => { onLogout(); close(); }}>Déconnexion</button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { navigate('/connexion'); close(); }}>Connexion</button>
                <button className="primary" onClick={() => { navigate('/inscription'); close(); }}>Inscription</button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="shell row">
        <div className="eco-line">
          <span className="eco-dot" aria-hidden="true"></span>
          <span>Site éco-conçu — &lt; 500 Ko / page, &lt; 15 requêtes HTTP, polices système</span>
        </div>
        <div>© 2026 Recette &amp; Avis · TI616 EFREI · <a href="#/mentions" onClick={(e) => { e.preventDefault(); navigate('/mentions'); }}>Mentions</a></div>
      </div>
    </footer>
  );
}
