// Public user profile + follow system
const { useState: useStateU, useMemo: useMemoU, useEffect: useEffectU } = React;

function Avatar({ user, size }) {
  const cls = "avatar" + (size ? " " + size : "");
  return <span className={cls} aria-hidden="true">{window.RA_initials(user?.nom)}</span>;
}

function FollowButton({ state, setState, navigate, currentUser, targetId }) {
  if (!currentUser) {
    return <button className="follow-btn" onClick={()=>navigate("/connexion")}>+ Suivre</button>;
  }
  if (currentUser.id === targetId) return null;

  const following = window.RA_isFollowing(state.follows, currentUser.id, targetId);

  async function toggle() {
    try {
      const data = await window.RA_api.follow(targetId);
      setState(s => {
        if (data.following) {
          return {
            ...s,
            follows: [...s.follows, { id: "fl_" + targetId, follower_id: currentUser.id, following_id: targetId }],
          };
        }
        return {
          ...s,
          follows: s.follows.filter(f => !(f.follower_id === currentUser.id && f.following_id === targetId)),
        };
      });
    } catch (_) {}
  }

  return (
    <button className={"follow-btn" + (following ? " following" : "")} onClick={toggle} aria-pressed={following}>
      {following ? "✓ Suivi" : "+ Suivre"}
    </button>
  );
}

function UserRow({ user, state, setState, navigate, currentUser }) {
  const recipeCount = window.RA_recipesByAuthor(state.recipes, state.users, user.id).length;
  return (
    <div className="user-row">
      <Avatar user={user} />
      <a href={`#/utilisateurs/${user.id}`}
         onClick={(e)=>{e.preventDefault();navigate(`/utilisateurs/${user.id}`);}}
         className="info" style={{textDecoration:"none", color:"inherit"}}>
        <div className="nom">{user.nom} {user.role === "admin" && <span className="role-badge admin" style={{marginLeft:4}}>admin</span>}</div>
        <div className="meta">{recipeCount} recette{recipeCount>1?"s":""}</div>
      </a>
      <FollowButton state={state} setState={setState} navigate={navigate} currentUser={currentUser} targetId={user.id} />
    </div>
  );
}

function UserProfile({ state, setState, navigate, route, currentUser }) {
  const userId = route.params.id;

  // L'utilisateur peut être dans le state ou doit être chargé depuis l'API
  const [user, setUser] = useStateU(() => window.RA_userById(state.users, userId) || null);
  const [userLoading, setUserLoading] = useStateU(!window.RA_userById(state.users, userId));
  const [followers, setFollowers] = useStateU([]);
  const [following, setFollowing] = useStateU([]);
  const [socialLoading, setSocialLoading] = useStateU(true);

  const [tab, setTab] = useStateU(route.params.tab || "recipes");

  useEffectU(() => {
    setTab(route.params.tab || "recipes");
  }, [route.params.tab]);

  useEffectU(() => {
    setFollowers([]);
    setFollowing([]);
    setSocialLoading(true);

    // Vérifier si l'utilisateur est déjà dans le state
    const known = window.RA_userById(state.users, userId);
    if (known) {
      setUser(known);
      setUserLoading(false);
    } else {
      setUserLoading(true);
      window.RA_api.getUser(userId)
        .then(u => {
          setUser(u);
          // Ajouter dans state.users pour les futures références
          setState(s => ({
            ...s,
            users: s.users.some(x => x.id === u.id) ? s.users : [...s.users, u],
          }));
        })
        .catch(() => setUser(null))
        .finally(() => setUserLoading(false));
    }

    // Charger toujours les followers/following depuis l'API (données fraîches)
    Promise.all([
      window.RA_api.getFollowers(userId).catch(() => []),
      window.RA_api.getFollowing(userId).catch(() => []),
    ]).then(([fl, flg]) => {
      setFollowers(fl);
      setFollowing(flg);
    }).finally(() => setSocialLoading(false));
  }, [userId]);

  // useMemo doit être avant tout return conditionnel (Rules of Hooks)
  const recipes = useMemoU(() => window.RA_recipesByAuthor(state.recipes, state.users, userId), [state.recipes, state.users, userId]);

  if (userLoading) {
    return <p className="muted">Chargement du profil…</p>;
  }
  if (!user) return <NotFound navigate={navigate} />;

  const isMe = currentUser && currentUser.id === userId;

  return (
    <>
      <button className="ghost small mb-2" onClick={()=>navigate("/recettes")}>← Retour aux recettes</button>

      <div className="user-head">
        <Avatar user={user} size="lg" />
        <div className="info">
          <h1>{user.nom} {user.role === "admin" && <span className="role-badge admin" style={{verticalAlign:"middle"}}>admin</span>}</h1>
          <div className="muted" style={{fontSize:13}}>Membre depuis {window.RA_shortDate(user.date_creation)}</div>
          {user.bio && <p className="bio">{user.bio}</p>}
          <div className="stats">
            <button className="stat linklike" onClick={()=>setTab("recipes")}>
              <strong>{recipes.length}</strong> recette{recipes.length>1?"s":""}
            </button>
            <button className="stat linklike" onClick={()=>setTab("followers")}>
              <strong>{socialLoading ? "…" : followers.length}</strong> abonné{followers.length>1?"s":""}
            </button>
            <button className="stat linklike" onClick={()=>setTab("following")}>
              <strong>{socialLoading ? "…" : following.length}</strong> abonnement{following.length>1?"s":""}
            </button>
          </div>
          <div className="actions">
            {!isMe && <FollowButton state={state} setState={setState} navigate={navigate} currentUser={currentUser} targetId={userId} />}
            {isMe && <button className="ghost small" onClick={()=>navigate("/profil")}>Modifier mon profil</button>}
          </div>
        </div>
      </div>

      <div className="user-tabs" role="tablist">
        <button role="tab" aria-selected={tab==="recipes"} className={tab==="recipes" ? "on" : ""} onClick={()=>setTab("recipes")}>Recettes ({recipes.length})</button>
        <button role="tab" aria-selected={tab==="followers"} className={tab==="followers" ? "on" : ""} onClick={()=>setTab("followers")}>Abonnés ({followers.length})</button>
        <button role="tab" aria-selected={tab==="following"} className={tab==="following" ? "on" : ""} onClick={()=>setTab("following")}>Abonnements ({following.length})</button>
      </div>

      {tab === "recipes" && (
        <div>
          {recipes.length === 0 && <p className="muted">{isMe ? "Vous n'avez pas encore publié de recette." : "Cet utilisateur n'a pas encore publié de recette."}</p>}
          {recipes.map(r => {
            const avg = window.RA_getAvg(state.notes, r.id);
            const count = window.RA_getNoteCount(state.notes, r.id);
            return (
              <a key={r.id} href={`#/recettes/${r.id}`} className="recipe-card"
                 onClick={(e)=>{e.preventDefault();navigate(`/recettes/${r.id}`);}}>
                <h3>{r.titre}</h3>
                <div className="meta">
                  <CategoryPill>{r.categorie}</CategoryPill>
                  <span>{r.temps_preparation} min</span>
                  <span className="sep">·</span>
                  <Stars value={avg || 0} />
                  <span>{avg ? `${avg.toFixed(1)} (${count})` : "Pas encore noté"}</span>
                </div>
                <p>{r.description}</p>
              </a>
            );
          })}
        </div>
      )}

      {tab === "followers" && (
        <div>
          {socialLoading && <p className="muted">Chargement…</p>}
          {!socialLoading && followers.length === 0 && <p className="muted">Aucun abonné pour l'instant.</p>}
          {followers.map(u => (
            <UserRow key={u.id} user={u} state={state} setState={setState} navigate={navigate} currentUser={currentUser} />
          ))}
        </div>
      )}

      {tab === "following" && (
        <div>
          {socialLoading && <p className="muted">Chargement…</p>}
          {!socialLoading && following.length === 0 && <p className="muted">N'est abonné à personne pour l'instant.</p>}
          {following.map(u => (
            <UserRow key={u.id} user={u} state={state} setState={setState} navigate={navigate} currentUser={currentUser} />
          ))}
        </div>
      )}
    </>
  );
}

// Helper: clickable author link, used in recipe cards/details/comments
function AuthorLink({ state, navigate, authorName, prefix = "par" }) {
  const u = window.RA_userByName(state.users, authorName);
  if (!u) return <span className="muted">{prefix} {authorName || "—"}</span>;
  return (
    <a href={`#/utilisateurs/${u.id}`}
       className="author-link"
       onClick={(e)=>{e.stopPropagation(); e.preventDefault(); navigate(`/utilisateurs/${u.id}`);}}>
      <span className="by">{prefix}</span>
      <Avatar user={u} size="sm" />
      <span>{u.nom}</span>
    </a>
  );
}

Object.assign(window, { UserProfile, FollowButton, Avatar, AuthorLink, UserRow });
