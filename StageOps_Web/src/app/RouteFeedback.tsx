import { isRouteErrorResponse, useRouteError } from 'react-router'

export function RouteLoading() {
  return (
    <p role="status" className="p-8 text-content-muted">
      Chargement de StageOps…
    </p>
  )
}
export function RouteError() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <main className="min-h-screen bg-theme-void p-8 text-content-primary">
      <h1 className="text-2xl">
        {notFound ? 'Page introuvable' : 'Cette page ne peut pas être chargée'}
      </h1>
      <p className="mt-3 text-content-muted">
        {notFound
          ? 'Vérifiez l’adresse ou retournez au tableau de bord.'
          : 'Vérifiez votre connexion puis rechargez la page. Vos données locales sont conservées.'}
      </p>
      <a href="/" className="mt-5 inline-block underline">
        Retour à StageOps
      </a>
    </main>
  )
}
