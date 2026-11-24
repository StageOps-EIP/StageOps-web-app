import assert from 'node:assert/strict'
import { it } from 'node:test'
import {
  emptyRegistrationForm, validateRegistration,
} from '../src/lib/registration-validation.ts'

it('requires only the account credentials sent to the API', () => {
  assert.deepEqual(Object.keys(emptyRegistrationForm), ['email', 'password', 'confirmPassword'])
  assert.deepEqual(validateRegistration(emptyRegistrationForm), {
    email: 'Indiquez votre adresse e-mail.',
    password: 'Indiquez un mot de passe.',
    confirmPassword: 'Confirmez le mot de passe.',
  })

  const complete = { email: 'alice@example.com', password: 'Secret12!', confirmPassword: 'Secret12!' }
  assert.deepEqual(validateRegistration(complete), {})
  assert.equal(validateRegistration({ ...complete, email: 'pas-une-adresse' }).email, 'Saisissez une adresse e-mail valide.')
})

it('checks password requirements and confirmation before account creation', () => {
  const form = { email: 'alice@example.com', password: 'Secret12!', confirmPassword: 'Secret12!' }
  assert.equal(validateRegistration({ ...form, password: 'court' }).password, 'Utilisez au moins 8 caractères.')
  assert.equal(validateRegistration({ ...form, password: 'secret12!' }).password, 'Ajoutez au moins une majuscule.')
  assert.equal(validateRegistration({ ...form, password: 'Secretabc!' }).password, 'Ajoutez au moins un chiffre.')
  assert.equal(validateRegistration({ ...form, password: 'Secret123' }).password, 'Ajoutez au moins un caractère spécial.')
  assert.equal(validateRegistration({ ...form, confirmPassword: '' }).confirmPassword, 'Confirmez le mot de passe.')
  assert.equal(validateRegistration({ ...form, confirmPassword: 'Autre12!' }).confirmPassword, 'Les mots de passe ne correspondent pas.')
})
