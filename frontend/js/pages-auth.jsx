// Auth pages + profile
const { useState: useStateA, useMemo: useMemoA } = React;

function Login({ state, setState, navigate }) {
  const [email, setEmail] = useStateA("");
  const [pwd, setPwd] = useStateA("");
  const [err, setErr] = useStateA("");

  function submit(e) {
    e.preventDefault();
    if (!email.includes("@")) { setErr("Email invalide."); return; }
    if (!pwd) { setErr("Mot de passe requis."); return; }
    const u = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!u) { setErr("Identifiants incorrects."); return; }
    setState(s => ({ ...s, sessionUserId: u.id }));
    navigate(u.role === "admin" ? "/admin" : "/profil");
  }

  return (
    <div className="auth-card">
      <h1 style={{fontFamily:"var(--serif)", fontSize: 24}}>Connexion</h1>
      <p className="muted" style={{fontSize:14}}>Comptes de démo : <code>admin@recetteavis.fr</code> ou <code>camille@example.com</code> · n'importe quel mot de passe.</p>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="login-pwd">Mot de passe</label>
          <input id="login-pwd" type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} autoComplete="current-password" required />
        </div>
        {err && <div className="notice warn" role="alert">{err}</div>}
        <button type="submit" className="primary" style={{width:"100%"}}>Se connecter</button>
      </form>
      <p className="mt-3 muted" style={{fontSize:14, textAlign:"center"}}>
        Pas encore de compte ?{" "}
        <a href="#/inscription" onClick={(e)=>{e.preventDefault();navigate("/inscription");}}>Créer un compte</a>
      </p>
    </div>
  );
}

function Register({ state, setState, navigate }) {
  const [nom, setNom] = useStateA("");
  const [email, setEmail] = useStateA("");
  const [pwd, setPwd] = useStateA("");
  const [pwd2, setPwd2] = useStateA("");
  const [err, setErr] = useStateA({});

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (nom.trim().length < 2) errs.nom = "Nom requis (≥ 2 caractères).";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = "Email invalide.";
    if (state.users.some(u => u.email.toLowerCase() === email.toLowerCase())) errs.email = "Email déjà utilisé.";
    if (pwd.length < 8) errs.pwd = "Mot de passe : 8 caractères minimum.";
    if (pwd !== pwd2) errs.pwd2 = "Les mots de passe ne correspondent pas.";
    setErr(errs);
    if (Object.keys(errs).length) return;
    const u = {
      id: window.RA_uid("u"),
      nom: nom.trim(),
      email: email.trim().toLowerCase(),
      role: "user",
      date_creation: new Date().toISOString().slice(0,10),
      mot_de_passe: "•••",
    };
    setState(s => ({ ...s, users: [...s.users, u], sessionUserId: u.id }));
    navigate("/profil");
  }

  return (
    <div className="auth-card">
      <h1 style={{fontFamily:"var(--serif)", fontSize: 24}}>Créer un compte</h1>
      <p className="muted" style={{fontSize:14}}>Validation côté serveur · mot de passe hashé avec bcrypt.</p>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="reg-nom">Nom</label>
          <input id="reg-nom" value={nom} onChange={(e)=>setNom(e.target.value)} autoComplete="name" />
          {err.nom && <div className="err">{err.nom}</div>}
        </div>
        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <input id="reg-email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" />
          {err.email && <div className="err">{err.email}</div>}
        </div>
        <div className="field">
          <label htmlFor="reg-pwd">Mot de passe</label>
          <input id="reg-pwd" type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} autoComplete="new-password" />
          <div className="hint">8 caractères minimum.</div>
          {err.pwd && <div className="err">{err.pwd}</div>}
        </div>
        <div className="field">
          <label htmlFor="reg-pwd2">Confirmer le mot de passe</label>
          <input id="reg-pwd2" type="password" value={pwd2} onChange={(e)=>setPwd2(e.target.value)} autoComplete="new-password" />
          {err.pwd2 && <div className="err">{err.pwd2}</div>}
        </div>
        <button type="submit" className="primary" style={{width:"100%"}}>Créer mon compte</button>
      </form>
      <p className="mt-3 muted" style={{fontSize:14, textAlign:"center"}}>
        Déjà inscrit ?{" "}
        <a href="#/connexion" onClick={(e)=>{e.preventDefault();navigate("/connexion");}}>Se connecter</a>
      </p>
    </div>
  );
}

function Profile({ state, setState, navigate, currentUser }) {
  if (!currentUser) {
    return (
      <div className="auth-card">
        <div className="notice warn">Vous devez être connecté pour accéder à cette page.</div>
        <button className="primary" onClick={()=>navigate("/connexion")}>Se connecter</button>
      </div>
    );
  }
  const [nom, setNom] = useStateA(currentUser.nom);
  const [email, setEmail] = useStateA(currentUser.email);
  const [saved, setSaved] = useStateA(false);
  const [confirmDelete, setConfirmDelete] = useStateA(false);

  const myRecipes = useMemoA(() => window.RA_recipesByAuthor(state.recipes, state.users, currentUser.id), [state.recipes, state.users, currentUser.id]);
  const myComments = state.comments.filter(c => c.utilisateur_id === currentUser.id);
  const myNotes = state.notes.filter(n => n.utilisateur_id === currentUser.id);

  function save(e) {
    e.preventDefault();
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === currentUser.id ? { ...u, nom: nom.trim(), email: email.trim() } : u),
    }));
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  }
  function deleteAccount() {
    setState(s => ({
      ...s,
      users: s.users.filter(u => u.id !== currentUser.id),
      comments: s.comments.filter(c => c.utilisateur_id !== currentUser.id),
      notes: s.notes.filter(n => n.utilisateur_id !== currentUser.id),
      follows: s.follows.filter(f => f.follower_id !== currentUser.id && f.following_id !== currentUser.id),
      sessionUserId: null,
    }));
    navigate("/");
  }

  return (
    <>
      <h1 style={{fontFamily:"var(--serif)"}}>Mon profil</h1>
      <div className="profile-card mb-3">
        <form onSubmit={save}>
          <div className="field">
            <label>Nom</label>
            <input value={nom} onChange={(e)=>setNom(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Rôle</label>
            <input value={currentUser.role === "admin" ? "Administrateur" : "Utilisateur"} disabled />
          </div>
          <div className="field">
            <label>Inscrit le</label>
            <input value={window.RA_shortDate(currentUser.date_creation)} disabled />
          </div>
          <div className="row-flex">
            <button type="submit" className="primary">Enregistrer</button>
            {saved && <small style={{color:"var(--eco)"}}>✓ Modifications enregistrées</small>}
          </div>
        </form>
      </div>

      <div className="profile-card mb-3">
        <h2 style={{fontFamily:"var(--serif)", fontSize:18}}>Mon activité</h2>
        <div className="row-flex" style={{gap:24, flexWrap:"wrap"}}>
          <div><strong>{myNotes.length}</strong> <span className="muted">note{myNotes.length>1?"s":""}</span></div>
          <div><strong>{myComments.length}</strong> <span className="muted">commentaire{myComments.length>1?"s":""}</span></div>
          <div>
            <strong>{state.follows.filter(f=>f.following_id===currentUser.id).length}</strong>{" "}
            <a href={`#/utilisateurs/${currentUser.id}/followers`} className="muted"
               onClick={(e)=>{e.preventDefault();navigate(`/utilisateurs/${currentUser.id}/followers`);}}>abonnés</a>
          </div>
          <div>
            <strong>{state.follows.filter(f=>f.follower_id===currentUser.id).length}</strong>{" "}
            <a href={`#/utilisateurs/${currentUser.id}/following`} className="muted"
               onClick={(e)=>{e.preventDefault();navigate(`/utilisateurs/${currentUser.id}/following`);}}>abonnements</a>
          </div>
          <div style={{marginLeft:"auto"}}>
            <button className="ghost small" onClick={()=>navigate(`/utilisateurs/${currentUser.id}`)}>Voir mon profil public →</button>
          </div>
        </div>
        {myComments.length > 0 && (
          <>
            <hr />
            <h3 style={{fontSize:14, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:"0.06em"}}>Mes derniers commentaires</h3>
            {myComments.slice(0,3).map(c => {
              const r = window.RA_recipeById(state.recipes, c.recette_id);
              return (
                <div key={c.id} className="comment">
                  <div className="head">
                    <a href={`#/recettes/${c.recette_id}`} onClick={(e)=>{e.preventDefault();navigate(`/recettes/${c.recette_id}`);}}>{r ? r.titre : "Recette supprimée"}</a>
                    <span>·</span>
                    <span>{window.RA_shortDate(c.date_commentaire)}</span>
                  </div>
                  <div>{c.contenu}</div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="profile-card mb-3">
        <h2 style={{fontFamily:"var(--serif)", fontSize:18}}>
          Mes recettes
          <span className="muted" style={{fontSize:14, fontWeight:400, marginLeft:10}}>({myRecipes.length})</span>
        </h2>
        {myRecipes.length === 0 ? (
          <div style={{paddingTop:8}}>
            <p className="muted" style={{fontSize:14}}>Vous n'avez pas encore publié de recette.</p>
            <button className="primary small" onClick={() => navigate("/proposer")}>Proposer une recette</button>
          </div>
        ) : (
          <>
            <div style={{display:"flex", flexDirection:"column", gap:0, marginTop:8}}>
              {myRecipes.map(r => {
                const avg = window.RA_getAvg(state.notes, r.id);
                const cnt = window.RA_getNoteCount(state.notes, r.id);
                return (
                  <a key={r.id} href={`#/recettes/${r.id}`}
                     onClick={(e) => {e.preventDefault(); navigate(`/recettes/${r.id}`);}}
                     style={{display:"flex", alignItems:"center", gap:14, padding:"14px 0",
                             borderBottom:"1px solid var(--rule)", textDecoration:"none", color:"inherit"}}>
                    <div style={{flex:1, minWidth:0}}>
                      <div style={{fontWeight:600, fontSize:15, color:"var(--ink)"}}>{r.titre}</div>
                      <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginTop:4}}>
                        <CategoryPill>{r.categorie}</CategoryPill>
                        <span style={{fontSize:13, color:"var(--ink-3)"}}>⏱ {r.temps_preparation} min</span>
                        <Stars value={avg || 0} size={13} />
                        <span style={{fontSize:13, color:"var(--ink-3)"}}>
                          {avg ? `${avg.toFixed(1)} (${cnt} avis)` : "Pas encore noté"}
                        </span>
                      </div>
                    </div>
                    <span style={{color:"var(--ink-3)", fontSize:18, flexShrink:0}}>›</span>
                  </a>
                );
              })}
            </div>
            <div style={{marginTop:14}}>
              <button className="ghost small" onClick={() => navigate("/proposer")}>+ Proposer une recette</button>
            </div>
          </>
        )}
      </div>

      <div className="profile-card" style={{borderColor:"var(--warn)"}}>
        <h2 style={{fontFamily:"var(--serif)", fontSize:18, color:"var(--warn)"}}>Zone dangereuse</h2>
        <p className="muted" style={{fontSize:14}}>La suppression de votre compte est définitive et entraîne la suppression de vos commentaires et de vos notes.</p>
        {!confirmDelete ? (
          <button className="danger" onClick={()=>setConfirmDelete(true)}>Supprimer mon compte</button>
        ) : (
          <div className="notice warn">
            <p style={{margin:0}}><strong>Confirmer la suppression ?</strong> Cette action est irréversible.</p>
            <div className="row-flex mt-2">
              <button className="danger" onClick={deleteAccount}>Oui, supprimer définitivement</button>
              <button onClick={()=>setConfirmDelete(false)}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

Object.assign(window, { Login, Register, Profile });
