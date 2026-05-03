// Main app: router, state and layout
const { useState: useStateApp, useEffect: useEffectApp } = React;

const ACCENT_PRESETS = {
  forest:     { accent: "oklch(0.5 0.11 150)",  accentInk: "oklch(0.36 0.1 150)",  soft: "oklch(0.93 0.05 150)" },
  sage:       { accent: "oklch(0.58 0.07 145)", accentInk: "oklch(0.42 0.07 145)", soft: "oklch(0.94 0.03 145)" },
  olive:      { accent: "oklch(0.55 0.09 120)", accentInk: "oklch(0.4 0.09 120)",  soft: "oklch(0.94 0.04 120)" },
  pine:       { accent: "oklch(0.42 0.09 165)", accentInk: "oklch(0.3 0.08 165)",  soft: "oklch(0.93 0.04 165)" },
};

function parseRoute(hash) {
  const path = (hash || "").replace(/^#/, "") || "/";
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home", params: {} };
  if (parts[0] === "recettes" && parts.length === 1) return { name: "list", params: {} };
  if (parts[0] === "recettes" && parts.length === 2) return { name: "detail", params: { id: parts[1] } };
  if (parts[0] === "connexion") return { name: "login", params: {} };
  if (parts[0] === "inscription") return { name: "register", params: {} };
  if (parts[0] === "profil") return { name: "profile", params: {} };
  if (parts[0] === "mentions") return { name: "mentions", params: {} };
  if (parts[0] === "proposer") return { name: "submit", params: {} };
  if (parts[0] === "about") return { name: "about", params: {} };
  if (parts[0] === "contact") return { name: "contact", params: {} };
  if (parts[0] === "utilisateurs" && parts.length >= 2) return { name: "user", params: { id: parts[1], tab: parts[2] || null } };
  if (parts[0] === "admin") {
    if (parts.length === 1) return { name: "admin", params: {} };
    if (parts[1] === "recettes") return { name: "admin-recipes", params: {} };
    if (parts[1] === "utilisateurs") return { name: "admin-users", params: {} };
    if (parts[1] === "commentaires") return { name: "admin-comments", params: {} };
  }
  return { name: "404", params: {} };
}

function App() {
  const [state, setState] = useStateApp(() => ({
    recipes:       [],
    users:         [],
    notes:         [],
    follows:       [],
    comments:      [],
    sessionUserId: null,
    loading:       true,
  }));
  const [route, setRoute] = useStateApp(() => parseRoute(window.location.hash));

  // ─── Initialisation depuis l'API au démarrage ────────────────────────────
  useEffectApp(() => {
    async function init() {
      try {
        const [meRes, recipesRes] = await Promise.allSettled([
          window.RA_api.getMe(),
          window.RA_api.getRecettes({ limit: 50 }),
        ]);

        const meUser = meRes.status === "fulfilled" ? meRes.value : null;

        // Si connecté, charger les abonnements de l'utilisateur
        let followsData = [];
        if (meUser) {
          followsData = await window.RA_api.getFollowing(meUser.id).catch(() => []);
        }

        setState(s => {
          const next = { ...s, loading: false, users: [...s.users] };

          if (meUser) {
            next.sessionUserId = meUser.id;
            next.users  = [meUser];
            next.follows = followsData.map(f => ({
              id:           "fl_" + f.id,
              follower_id:  meUser.id,
              following_id: f.id,
            }));
          }

          if (recipesRes.status === "fulfilled") {
            const recettes = recipesRes.value.recettes || [];
            next.recipes = recettes.map(window.RA_mapApiRecette);

            // Notes agrégées par recette (pour l'affichage des étoiles)
            next.notes = recettes
              .filter(r => r.note_count > 0)
              .map(r => ({
                id:         "agg_" + r.id,
                recette_id: r.id,
                _agg:       true,
                _moyenne:   r.note_moyenne,
                _count:     r.note_count,
              }));

            // Ajouter les auteurs des recettes dans state.users
            const authorMap = {};
            recettes.forEach(r => {
              if (r.auteur_id && !authorMap[r.auteur_id]) {
                authorMap[r.auteur_id] = {
                  id:   r.auteur_id,
                  nom:  r.auteur_nom,
                  role: r.auteur_role || "user",
                };
              }
            });
            const knownIds = new Set(next.users.map(u => u.id));
            Object.values(authorMap).forEach(u => {
              if (!knownIds.has(u.id)) next.users.push(u);
            });
          }

          return next;
        });
      } catch (_) {
        setState(s => ({ ...s, loading: false }));
      }
    }
    init();
  }, []);

  // ─── Hash routing ────────────────────────────────────────────────────────
  useEffectApp(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function navigate(path) {
    window.location.hash = path;
    window.scrollTo(0, 0);
  }
  window.RA_navigate = navigate;

  // Apparence fixe du prototype front-end.
  useEffectApp(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.setAttribute("data-density", "comfortable");
    const a = ACCENT_PRESETS.forest;
    root.style.setProperty("--accent", a.accent);
    root.style.setProperty("--accent-ink", a.accentInk);
    root.style.setProperty("--accent-soft", a.soft);
  }, []);

  const currentUser = state.sessionUserId
    ? state.users.find(u => u.id === state.sessionUserId) || null
    : null;

  async function logout() {
    try { await window.RA_api.logout(); } catch (_) {}
    setState(s => ({ ...s, sessionUserId: null, follows: [] }));
    navigate("/");
  }

  // Écran de chargement pendant l'initialisation API
  if (state.loading) {
    return (
      <div className="app">
        <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p className="muted">Chargement…</p>
        </div>
      </div>
    );
  }

  let page;
  switch (route.name) {
    case "home":          page = <Home state={state} navigate={navigate} />; break;
    case "list":          page = <RecipeList state={state} navigate={navigate} route={route} />; break;
    case "detail":        page = <RecipeDetail state={state} setState={setState} navigate={navigate} route={route} currentUser={currentUser} showImages={false} />; break;
    case "login":         page = <Login state={state} setState={setState} navigate={navigate} />; break;
    case "register":      page = <Register state={state} setState={setState} navigate={navigate} />; break;
    case "profile":       page = <Profile state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case "admin":         page = <AdminDash state={state} navigate={navigate} currentUser={currentUser} />; break;
    case "admin-recipes": page = <AdminRecipes state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case "admin-users":   page = <AdminUsers state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case "admin-comments":page = <AdminComments state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case "mentions":      page = <Mentions navigate={navigate} />; break;
    case "submit":        page = <SubmitRecipe state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case "about":         page = <About navigate={navigate} />; break;
    case "contact":       page = <Contact navigate={navigate} />; break;
    case "user":          page = <UserProfile state={state} setState={setState} navigate={navigate} route={route} currentUser={currentUser} />; break;
    default:              page = <NotFound navigate={navigate} />;
  }

  return (
    <div className="app" data-screen-label={route.name}>
      <SiteHeader route={route} navigate={navigate} currentUser={currentUser} onLogout={logout} />
      <main className="shell">{page}</main>
      <SiteFooter />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
