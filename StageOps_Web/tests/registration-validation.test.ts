import assert from 'node:assert/strict'
import { it } from 'node:test'
import {
  emptyRegistrationForm, validateCredentials, validateIdentity,
} from '../src/lib/registration-validation.ts'

it('identifies missing registration fields and rejects an invalid email', () => {
  assert.deepEqual(validateIdentity(emptyRegistrationForm), {
    firstName: 'Indiquez votre prénom.',
    lastName: 'Indiquez votre nom.',
    email: 'Indiquez votre adresse e-mail.',
    role: 'Choisissez votre rôle.',
  })

  assert.deepEqual(validateIdentity({
    ...emptyRegistrationForm,
    firstName: '  Alice ', lastName: ' Martin ', email: 'pas-une-adresse', role: 'Technicien',
  }), { email: 'Saisissez une adresse e-mail valide.' })
})

it('checks password requirements and confirmation before account creation', () => {
  const form = { ...emptyRegistrationForm, password: 'Secret12!', confirmPassword: 'Secret12!' }
  assert.deepEqual(validateCredentials(form), {})
  assert.equal(validateCredentials({ ...form, password: 'court' }).password, 'Utilisez au moins 8 caractères.')
  assert.equal(validateCredentials({ ...form, password: 'secret12!' }).password, 'Ajoutez au moins une majuscule.')
  assert.equal(validateCredentials({ ...form, password: 'Secretabc!' }).password, 'Ajoutez au moins un chiffre.')
  assert.equal(validateCredentials({ ...form, password: 'Secret123' }).password, 'Ajoutez au moins un caractère spécial.')
  assert.equal(validateCredentials({ ...form, confirmPassword: '' }).confirmPassword, 'Confirmez le mot de passe.')
  assert.equal(validateCredentials({ ...form, confirmPassword: 'Autre12!' }).confirmPassword, 'Les mots de passe ne correspondent pas.')
})
