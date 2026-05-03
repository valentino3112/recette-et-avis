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
  const [state, setState] = useStateApp(() => window.RA_loadState());
  const [route, setRoute] = useStateApp(() => parseRoute(window.location.hash));
  // Paramètres fixes du prototype front-end.
  const showImages = false;

  useEffectApp(() => { window.RA_saveState(state); }, [state]);
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

  const currentUser = state.sessionUserId ? state.users.find(u => u.id === state.sessionUserId) : null;

  function logout() {
    setState(s => ({ ...s, sessionUserId: null }));
    navigate("/");
  }

  let page;
  switch (route.name) {
    case "home": page = <Home state={state} navigate={navigate} />; break;
    case "list": page = <RecipeList state={state} navigate={navigate} route={route} />; break;
    case "detail": page = <RecipeDetail state={state} setState={setState} navigate={navigate} route={route} currentUser={currentUser} showImages={showImages} />; break;
    case "login": page = <Login state={state} setState={setState} navigate={navigate} />; break;
    case "register": page = <Register state={state} setState={setState} navigate={navigate} />; break;
    case "profile": page = <Profile state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case "admin": page = <AdminDash state={state} navigate={navigate} currentUser={currentUser} />; break;
    case "admin-recipes": page = <AdminRecipes state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case "admin-users": page = <AdminUsers state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case "admin-comments": page = <AdminComments state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case "mentions": page = <Mentions navigate={navigate} />; break;
    case "submit": page = <SubmitRecipe state={state} setState={setState} navigate={navigate} currentUser={currentUser} />; break;
    case "about": page = <About navigate={navigate} />; break;
    case "contact": page = <Contact navigate={navigate} />; break;
    case "user": page = <UserProfile state={state} setState={setState} navigate={navigate} route={route} currentUser={currentUser} />; break;
    default: page = <NotFound navigate={navigate} />;
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
