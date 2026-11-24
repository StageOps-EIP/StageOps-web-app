export const emptyRegistrationForm = {
  firstName: '', lastName: '', email: '', phone: '', role: '',
  password: '', confirmPassword: '',
}

export type RegistrationForm = typeof emptyRegistrationForm
export type RegistrationErrors = Partial<RegistrationForm>

export function validateIdentity(form: RegistrationForm): RegistrationErrors {
  const errors: RegistrationErrors = {}
  if (!form.firstName.trim()) errors.firstName = 'Indiquez votre prénom.'
  if (!form.lastName.trim()) errors.lastName = 'Indiquez votre nom.'
  if (!form.email.trim()) errors.email = 'Indiquez votre adresse e-mail.'
  else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
    errors.email = 'Saisissez une adresse e-mail valide.'
  }
  if (!form.role) errors.role = 'Choisissez votre rôle.'
  return errors
}

export function validateCredentials(form: RegistrationForm): RegistrationErrors {
  const errors: RegistrationErrors = {}
  if (!form.password) errors.password = 'Indiquez un mot de passe.'
  else if (form.password.length < 8) errors.password = 'Utilisez au moins 8 caractères.'
  else if (!/[A-Z]/.test(form.password)) errors.password = 'Ajoutez au moins une majuscule.'
  else if (!/[0-9]/.test(form.password)) errors.password = 'Ajoutez au moins un chiffre.'
  else if (!/[^a-zA-Z0-9]/.test(form.password)) errors.password = 'Ajoutez au moins un caractère spécial.'
  if (!form.confirmPassword) errors.confirmPassword = 'Confirmez le mot de passe.'
  else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas.'
  }
  return errors
}
