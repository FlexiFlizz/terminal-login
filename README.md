# Terminal Login

Ecran de login minimaliste style terminal avec logo S. et curseur clignotant.

Fond noir, logo SVG, curseur blanc qui clignote, input invisible - l'utilisateur tape le mot de passe a l'aveugle.

![preview](preview.png)

## Versions

### HTML standalone (`index.html`)

Zero dependance. Copie le fichier et modifie la config :

```js
const CONFIG = {
  password: 'acab1312',
  redirectUrl: null,          // URL apres login
  sessionKey: 'authenticated',
  autoLockMinutes: 20,
  onSuccess: null,            // callback custom
};
```

### React / Next.js (`terminal-login.tsx`)

```tsx
import { TerminalLogin, useTerminalAuth } from './terminal-login';

export default function App() {
  const { authenticated, isLoading, lock, onSuccess } = useTerminalAuth();

  if (isLoading) return <div style={{ background: '#000', height: '100vh' }} />;
  if (!authenticated) return <TerminalLogin onSuccess={onSuccess} />;

  return (
    <div>
      <p>Contenu protege</p>
      <button onClick={lock}>Lock</button>
    </div>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `password` | `string` | `"admin"` | Mot de passe |
| `onSuccess` | `() => void` | required | Callback apres login |
| `logoUrl` | `string` | `"https://solilok.fr"` | Lien du logo |
| `autoLockMinutes` | `number` | `20` | Auto-lock (0 = off) |
| `sessionKey` | `string` | `"authenticated"` | Cle sessionStorage |
| `customLogo` | `ReactNode` | S. logo | Logo custom |

## Fonctionnement

1. Ecran noir avec logo S.
2. Curseur blanc clignote
3. L'utilisateur tape (input invisible)
4. Enter = validation
5. Mauvais mdp = "Access denied" en rouge pendant 1s
6. Bon mdp = succes + callback/redirect
7. Auto-lock apres 20min d'inactivite

## License

MIT
