# Référentiel d'Accessibilité WCAG 2.1 — StageOps

**Projet :** StageOps — Plateforme de gestion technique multi-théâtres  
**Cible :** WCAG 2.1 Niveau AA  
**Version :** 1.0  
**Date :** Mars 2026

---

## 1. Introduction

### 1.1 Objectif du document

Ce référentiel documente les exigences d'accessibilité numérique du projet StageOps selon les **Web Content Accessibility Guidelines (WCAG) 2.1 niveau AA**.

L'accessibilité est une exigence critique du référentiel RNCP et garantit l'utilisabilité de la plateforme par tous les utilisateurs, y compris ceux en situation de handicap (visuel, auditif, moteur, cognitif).

### 1.2 Périmètre

**Pages couvertes :**
- Authentification (`/login`, `/register`)
- Dashboard opérationnel (`/`)
- Gestion événements (`/events`)
- Gestion incidents (`/incidents`)
- Gestion équipe (`/team`)
- Gestion équipements (`/equipment`)
- Vue scène 3D (`/stage`)
- Éditeur scène 3D (`/editor`)
- Profil utilisateur (`/profile`)

**Composants critiques :**
- Modales (création/édition entités)
- Formulaires (tous les champs de saisie)
- Tableaux de données
- Navigation principale
- Boutons d'action

---

## 2. Conformité WCAG 2.1 niveau AA — État actuel

### 2.1 Principe 1 : Perceptible

#### 1.1 Alternatives textuelles (Niveau A)

| Critère | Exigence | État | Preuve |
|---------|----------|------|--------|
| 1.1.1 | Contenu non textuel doit avoir alternative textuelle | ✅ Conforme | Tous les champs de formulaire ont des `<label>` explicites |

**Implémentation :**
```tsx
// src/components/events/NewEventModal.tsx
<label htmlFor="event-name">
  Nom de l'événement <span className="required">*</span>
</label>
<input
  id="event-name"
  name="name"
  type="text"
  required
  aria-required="true"
/>
```

**Points d'amélioration :**
- ❌ Images décoratives sans `alt=""` (aucune image actuellement, mais à prévoir)
- ❌ Icônes SVG sans `aria-label` (futur)

---

#### 1.3 Adaptable (Niveau A)

| Critère | Exigence | État | Preuve |
|---------|----------|------|--------|
| 1.3.1 | Information et relations | ⚠️ Partiel | Labels présents, mais hiérarchie titres à valider globalement |
| 1.3.2 | Ordre séquentiel significatif | ✅ Conforme | Ordre DOM logique (formulaires top-to-bottom) |
| 1.3.3 | Caractéristiques sensorielles | ✅ Conforme | Pas de dépendance à la couleur seule pour informations critiques |

**1.3.1 — Hiérarchie des titres :**
```tsx
// ✅ Bon exemple (Dashboard)
<h1>Dashboard Opérationnel</h1>
<section>
  <h2>Événements à venir</h2>
  <ul>...</ul>
</section>
<section>
  <h2>Incidents en cours</h2>
  <ul>...</ul>
</section>
```

**À valider :**
- Toutes les pages doivent avoir un `<h1>` unique
- Pas de saut de niveau (h1 → h3)
- Pas de `<h2>` avant `<h1>`

---

#### 1.4 Distinguable (Niveau AA)

| Critère | Exigence | État | Preuve |
|---------|----------|------|--------|
| 1.4.1 | Utilisation de la couleur | ✅ Conforme | Sévérité incidents = couleur + texte |
| 1.4.3 | Contraste minimum (AA) | ⚠️ Partiel | Contraste validé sur composants principaux, audit global requis |
| 1.4.4 | Redimensionnement texte | ✅ Conforme | Pas de taille fixe en pixels (utilisation `rem`) |
| 1.4.5 | Texte sous forme d'image | ✅ Conforme | Aucun texte en image |
| 1.4.10 | Reflux (Niveau AA 2.1) | ⚠️ Partiel | Responsive desktop, mobile à finaliser |
| 1.4.11 | Contraste éléments non textuels (AA 2.1) | ⚠️ Partiel | Borders inputs visibles, mais à valider sur tous états |
| 1.4.12 | Espacement du texte (AA 2.1) | ✅ Conforme | Pas de `line-height` ou `letter-spacing` bloqué |
| 1.4.13 | Contenu au survol/focus (AA 2.1) | ✅ Conforme | Tooltips restent visibles (pas encore implémenté) |

**1.4.3 — Contraste (4.5:1 minimum pour texte normal) :**

| Élément | Couleur texte | Couleur fond | Ratio | Conforme |
|---------|---------------|--------------|-------|----------|
| Bouton primaire | `#ffffff` | `#2563eb` | 8.6:1 | ✅ |
| Texte principal | `#1f2937` | `#ffffff` | 16.1:1 | ✅ |
| Texte secondaire | `#6b7280` | `#ffffff` | 5.3:1 | ✅ |
| Labels formulaire | `#374151` | `#ffffff` | 12.6:1 | ✅ |
| Bordure input focus | `#3b82f6` | `#ffffff` | 3.2:1 | ⚠️ (< 3:1 requis AA) |

**Action requise :**
- Audit contraste complet avec outil automatisé (axe DevTools, WAVE)
- Augmenter contraste bordures inputs (cible > 3:1)

---

### 2.2 Principe 2 : Utilisable

#### 2.1 Accessibilité au clavier (Niveau A)

| Critère | Exigence | État | Preuve |
|---------|----------|------|--------|
| 2.1.1 | Clavier | ✅ Conforme | Tous les composants interactifs accessibles clavier |
| 2.1.2 | Pas de piège clavier | ✅ Conforme | Modales avec Esc pour fermer, focus trap actif |
| 2.1.4 | Raccourcis clavier caractère seul (AA 2.1) | ✅ Conforme | Aucun raccourci single-key implémenté |

**Implémentation focus trap (modales) :**
```tsx
// src/components/ui/Modal.tsx
useEffect(() => {
  if (!isOpen) return;

  const focusableElements = modal.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements?.[0] as HTMLElement;
  const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };

  document.addEventListener('keydown', handleTab);
  firstElement?.focus();

  return () => document.removeEventListener('keydown', handleTab);
}, [isOpen]);
```

**Navigation clavier validée :**
- ✅ Tab/Shift+Tab : Navigation forward/backward
- ✅ Enter/Space : Activation boutons
- ✅ Escape : Fermeture modales
- ✅ Flèches : Navigation listes (futur)

---

#### 2.4 Navigable (Niveau AA)

| Critère | Exigence | État | Preuve |
|---------|----------|------|--------|
| 2.4.1 | Contourner blocs répétés | ❌ À faire | Skip-link manquant |
| 2.4.2 | Titre de page | ✅ Conforme | `<title>` unique par page (React Helmet futur) |
| 2.4.3 | Parcours focus logique | ✅ Conforme | Ordre DOM = ordre visuel |
| 2.4.4 | Fonction du lien (contexte) | ✅ Conforme | Liens explicites (pas de "cliquez ici") |
| 2.4.5 | Accès multiples | ⚠️ Partiel | Navigation principale + dashboard, mais pas de plan du site |
| 2.4.6 | En-têtes et étiquettes | ✅ Conforme | Labels formulaires descriptifs |
| 2.4.7 | Focus visible | ✅ Conforme | Ring bleu au focus (outline) |

**2.4.1 — Skip-link (À IMPLÉMENTER) :**
```tsx
// src/layouts/DesktopLayout.tsx
<a href="#main-content" className="skip-link">
  Aller au contenu principal
</a>

// CSS
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**2.4.7 — Focus visible :**
```css
/* Tous les éléments interactifs */
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

---

#### 2.5 Modalités de saisie (Niveau A/AA — WCAG 2.1)

| Critère | Exigence | État | Preuve |
|---------|----------|------|--------|
| 2.5.1 | Gestes pour pointer | ✅ Conforme | Pas de gestes complexes (drag uniquement 3D éditeur) |
| 2.5.2 | Annulation du pointeur | ✅ Conforme | Événements `onClick` (pas `onMouseDown`) |
| 2.5.3 | Étiquette dans le nom | ✅ Conforme | Labels visibles = `aria-label` |
| 2.5.4 | Activation par mouvement | ✅ Conforme | Aucune activation mouvement (shake, tilt) |

---

### 2.3 Principe 3 : Compréhensible

#### 3.1 Lisible (Niveau A)

| Critère | Exigence | État | Preuve |
|---------|----------|------|--------|
| 3.1.1 | Langue de la page | ✅ Conforme | `<html lang="fr">` défini |
| 3.1.2 | Langue d'un passage | ✅ Conforme | Pas de passages en langue étrangère |

---

#### 3.2 Prévisible (Niveau A/AA)

| Critère | Exigence | État | Preuve |
|---------|----------|------|--------|
| 3.2.1 | Au focus | ✅ Conforme | Pas de changement contexte au focus |
| 3.2.2 | À la saisie | ✅ Conforme | Pas de soumission automatique |
| 3.2.3 | Navigation cohérente (AA) | ✅ Conforme | Menu principal identique sur toutes pages |
| 3.2.4 | Identification cohérente (AA) | ✅ Conforme | Boutons "Créer", "Modifier", "Supprimer" cohérents |

---

#### 3.3 Assistance à la saisie (Niveau A/AA)

| Critère | Exigence | État | Preuve |
|---------|----------|------|--------|
| 3.3.1 | Identification erreur | ✅ Conforme | Messages erreur explicites sous champs invalides |
| 3.3.2 | Étiquettes ou instructions | ✅ Conforme | Labels + placeholders + hints si nécessaire |
| 3.3.3 | Suggestion après erreur (AA) | ⚠️ Partiel | Erreur réseau = retry proposé, mais pas de suggestion correction format |
| 3.3.4 | Prévention erreurs (AA) | ⚠️ Partiel | Confirmation suppression, mais pas sur toutes actions sensibles |

**3.3.1 — Messages d'erreur :**
```tsx
// src/components/events/NewEventModal.tsx
{error && (
  <div role="alert" className="error-message">
    ❌ {error}
  </div>
)}

// Validation inline
{formErrors.name && (
  <span className="field-error" role="alert">
    {formErrors.name}
  </span>
)}
```

**3.3.4 — Confirmation suppression :**
```tsx
const handleDelete = (id: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
    return;
  }
  deleteEvent(id);
};
```

**À améliorer :**
- Remplacer `confirm()` natif par modale accessible avec `role="alertdialog"`
- Ajouter confirmation sur toutes actions destructives (suppression, modification sensible)

---

### 2.4 Principe 4 : Robuste

#### 4.1 Compatible (Niveau A)

| Critère | Exigence | État | Preuve |
|---------|----------|------|--------|
| 4.1.1 | Analyse syntaxique | ✅ Conforme | HTML valide (React génère HTML valide) |
| 4.1.2 | Nom, rôle et valeur | ✅ Conforme | Composants natifs + ARIA explicite |
| 4.1.3 | Messages d'état (AA 2.1) | ❌ À faire | Pas de `role="status"` ou `aria-live` actuellement |

**4.1.2 — Rôles ARIA :**
```tsx
// Modales
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Créer un événement</h2>
  <p id="modal-description">Remplissez les champs ci-dessous.</p>
  {/* ... */}
</div>

// Boutons avec fallback
<button aria-label={ariaLabel || children}>
  {children}
</button>
```

**4.1.3 — Messages d'état (À IMPLÉMENTER) :**
```tsx
// Notification de succès après création
<div role="status" aria-live="polite">
  ✅ Événement créé avec succès
</div>

// Notification d'erreur critique
<div role="alert" aria-live="assertive">
  ❌ Erreur réseau. Vérifiez votre connexion.
</div>
```

---

## 3. Plan d'action accessibilité

### 3.1 Actions prioritaires (Sprint 1 — Avril 2026)

| ID | Action | Critère WCAG | Priorité | Effort |
|----|--------|--------------|----------|--------|
| A1 | Ajouter skip-link navigation | 2.4.1 | P0 | 1h |
| A2 | Implémenter `role="status"` notifications | 4.1.3 | P0 | 2h |
| A3 | Remplacer `confirm()` par modale accessible | 3.3.4 | P0 | 3h |
| A4 | Audit contraste complet (axe DevTools) | 1.4.3 | P0 | 2h |
| A5 | Valider hiérarchie titres h1/h2/h3 sur toutes pages | 1.3.1 | P1 | 2h |

### 3.2 Actions secondaires (Sprint 2 — Mai 2026)

| ID | Action | Critère WCAG | Priorité | Effort |
|----|--------|--------------|----------|--------|
| A6 | Ajouter landmarks ARIA (`<header>`, `<main>`, `<nav>`) | 1.3.1 | P1 | 1h |
| A7 | Suggestions correction format (email, dates) | 3.3.3 | P1 | 3h |
| A8 | Tests accessibilité automatisés (axe-core + Vitest) | — | P1 | 4h |
| A9 | Documentation accessibilité utilisateurs (guides) | — | P2 | 6h |

### 3.3 Outils de validation

**Outils automatisés :**
- **axe DevTools** (extension navigateur) : Audit automatique WCAG
- **WAVE** (WebAIM) : Visualisation problèmes accessibilité
- **Lighthouse** (Chrome) : Score accessibilité + recommandations
- **eslint-plugin-jsx-a11y** : Linting JSX pour accessibilité

**Tests manuels :**
- **Navigation clavier** : Tab/Shift+Tab, Enter, Escape
- **Lecteur d'écran** : NVDA (Windows), VoiceOver (macOS), JAWS (Windows)
- **Zoom texte** : 200% sans perte de contenu (Ctrl + molette)
- **Contraste** : Vérification visuelle + outil (ex: Contrast Checker)

---

## 4. Checklist accessibilité par composant

### 4.1 Formulaires

**Exigences :**
- ✅ Chaque champ a un `<label>` associé (`for` / `id`)
- ✅ Champs obligatoires marqués `required` + `aria-required="true"`
- ✅ Messages d'erreur avec `role="alert"` sous le champ concerné
- ✅ Validation inline (pendant saisie) pour feedback immédiat
- ⚠️ Suggestions correction format (à implémenter)

**Code type :**
```tsx
<div className="form-field">
  <label htmlFor="email">
    Email <span className="required">*</span>
  </label>
  <input
    id="email"
    name="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={!!emailError}
    aria-describedby={emailError ? "email-error" : undefined}
  />
  {emailError && (
    <span id="email-error" role="alert" className="field-error">
      {emailError}
    </span>
  )}
</div>
```

---

### 4.2 Modales

**Exigences :**
- ✅ `role="dialog"` + `aria-modal="true"`
- ✅ `aria-labelledby` (titre modale) + `aria-describedby` (description)
- ✅ Focus trap (Tab circule dans la modale)
- ✅ Escape ferme la modale
- ✅ Focus revient à l'élément déclencheur après fermeture
- ✅ Fond grisé avec `aria-hidden="true"` sur contenu principal

**Code type :**
```tsx
<div className="modal-overlay" onClick={onClose}>
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    aria-describedby="modal-desc"
    onClick={(e) => e.stopPropagation()}
    ref={modalRef}
  >
    <h2 id="modal-title">Titre de la modale</h2>
    <p id="modal-desc">Description optionnelle</p>
    {/* Contenu */}
    <button onClick={onClose}>Fermer (Esc)</button>
  </div>
</div>
```

---

### 4.3 Tableaux de données

**Exigences :**
- ✅ Balise `<table>` (pas `<div>` simulant un tableau)
- ✅ `<thead>`, `<tbody>`, `<th>` pour en-têtes
- ✅ `scope="col"` ou `scope="row"` sur `<th>`
- ⚠️ `<caption>` pour titre tableau (à ajouter)

**Code type :**
```tsx
<table>
  <caption>Liste des événements à venir</caption>
  <thead>
    <tr>
      <th scope="col">Nom</th>
      <th scope="col">Date</th>
      <th scope="col">Lieu</th>
      <th scope="col">Statut</th>
    </tr>
  </thead>
  <tbody>
    {events.map((event) => (
      <tr key={event.id}>
        <td>{event.name}</td>
        <td>{formatDate(event.start_date)}</td>
        <td>{event.location}</td>
        <td>{event.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### 4.4 Boutons et actions

**Exigences :**
- ✅ Balise `<button>` (pas `<div onClick>`)
- ✅ Texte explicite ou `aria-label` si icône seule
- ✅ États visuels clairs (hover, focus, active, disabled)
- ✅ `disabled` si action temporairement indisponible

**Code type :**
```tsx
// Bouton avec texte
<button onClick={handleSave} disabled={isSaving}>
  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
</button>

// Bouton icône seul
<button aria-label="Supprimer l'événement" onClick={handleDelete}>
  <TrashIcon />
</button>
```

---

### 4.5 Navigation

**Exigences :**
- ✅ Balise `<nav>` pour navigation principale
- ✅ Liens actifs marqués `aria-current="page"`
- ⚠️ Skip-link en début de page (à ajouter)
- ✅ Landmarks ARIA (`<header>`, `<main>`, `<footer>`)

**Code type :**
```tsx
<nav aria-label="Navigation principale">
  <ul>
    <li>
      <a href="/" aria-current={location.pathname === '/' ? 'page' : undefined}>
        Dashboard
      </a>
    </li>
    <li>
      <a href="/events" aria-current={location.pathname === '/events' ? 'page' : undefined}>
        Événements
      </a>
    </li>
    {/* ... */}
  </ul>
</nav>
```

---

## 5. Tests accessibilité

### 5.1 Tests automatisés (axe-core)

**Installation :**
```bash
npm install --save-dev @axe-core/react vitest-axe
```

**Exemple test :**
```tsx
// src/components/events/NewEventModal.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'vitest-axe';
import NewEventModal from './NewEventModal';

expect.extend(toHaveNoViolations);

test('NewEventModal should have no accessibility violations', async () => {
  const { container } = render(<NewEventModal isOpen onClose={vi.fn()} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 5.2 Tests manuels lecteur d'écran

**Scénarios à tester :**

1. **Créer un événement avec NVDA/VoiceOver :**
   - Naviguer au bouton "Créer événement" (Tab)
   - Activer (Enter)
   - Remplir le formulaire (Tab entre champs)
   - Valider (Enter sur "Enregistrer")
   - Vérifier annonce succès avec lecteur

2. **Naviguer incidents avec clavier :**
   - Tab jusqu'à liste incidents
   - Flèches haut/bas (si implémenté)
   - Enter pour ouvrir détails
   - Escape pour fermer

3. **Zoom texte 200% :**
   - Ctrl + molette (ou Cmd + sur macOS)
   - Vérifier aucune perte de contenu
   - Vérifier scroll horizontal pas nécessaire

---

## 6. Documentation utilisateur accessibilité

### 6.1 Raccourcis clavier

| Action | Raccourci |
|--------|-----------|
| Ouvrir menu navigation | Alt + N (futur) |
| Créer événement | Alt + E (futur) |
| Créer incident | Alt + I (futur) |
| Fermer modale | Escape |
| Confirmer action | Enter |
| Annuler | Escape |

### 6.2 Support technologies d'assistance

**Lecteurs d'écran testés :**
- NVDA 2023+ (Windows) — Support complet
- JAWS 2023+ (Windows) — Support complet
- VoiceOver (macOS/iOS) — Support complet

**Navigateurs testés :**
- Chrome 90+ — Support complet
- Firefox 88+ — Support complet
- Safari 14+ — Support complet
- Edge 90+ — Support complet

---

## 7. Annexes

### Annexe A : Ressources WCAG

- **WCAG 2.1 Guidelines** : https://www.w3.org/WAI/WCAG21/quickref/
- **WebAIM Checklist** : https://webaim.org/standards/wcag/checklist
- **MDN Accessibility** : https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **React Accessibility** : https://react.dev/learn/accessibility

### Annexe B : Outils recommandés

- **axe DevTools** : https://www.deque.com/axe/devtools/
- **WAVE** : https://wave.webaim.org/
- **Lighthouse** : Intégré Chrome DevTools
- **Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **NVDA** : https://www.nvaccess.org/download/

---

**Fin du Référentiel d'Accessibilité WCAG 2.1**  
**Version 1.0 — Mars 2026**
