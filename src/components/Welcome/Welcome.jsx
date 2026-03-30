export default function Welcome({ description }) {
  return (
    <div className="p-4">
      <p>{description || "Bienvenue sur notre application. Découvrez nos fonctionnalités et commencez votre aventure."}</p>
    </div>
  )
}
