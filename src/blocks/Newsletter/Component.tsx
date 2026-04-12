'use client'

import { RichText } from '@/components/RichText'
import { getClientSideURL } from '@/utilities/getURL'
import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { DefaultDocumentIDType } from 'payload'
import React, { useCallback, useState } from 'react'

export type NewsletterBlockProps = {
  blockName?: string | null
  blockType: 'newsletter'
  title: string
  description?: string | null
  form: FormType | number
  id?: DefaultDocumentIDType
}

export const NewsletterBlock: React.FC<NewsletterBlockProps> = (props) => {
  const { title, description, form: formFromProps } = props

  if (!formFromProps) return null

  const formID = typeof formFromProps === 'number' ? formFromProps : formFromProps.id
  const confirmationMessage =
    typeof formFromProps === 'number' ? undefined : formFromProps.confirmationMessage
  const confirmationType =
    typeof formFromProps === 'number' ? 'message' : formFromProps.confirmationType
  const submitButtonLabel =
    typeof formFromProps === 'number' ? 'Subscribe' : formFromProps.submitButtonLabel || 'Subscribe'

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [alreadySubscribed, setAlreadySubscribed] = useState(false)
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!email) return

      setError(undefined)

      const loadingTimer = setTimeout(() => setIsLoading(true), 300)

      fetch(`${getClientSideURL()}/api/form-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: formID,
          submissionData: [
            {
              field: 'email',
              value: email,
            },
          ],
        }),
      })
        .then(async (res) => {
          const json = await res.json().catch(() => ({}) as any)
          clearTimeout(loadingTimer)
          setIsLoading(false)

          const apiMessage = (json as any)?.message as string | undefined

          if (!res.ok) {
            // Duplicate newsletter subscription signalled by the backend
            if (apiMessage === 'newsletter-already-subscribed' || res.status === 409) {
              setError(undefined)
              setAlreadySubscribed(true)
              setHasSubmitted(true)
              return
            }

            const validationMessage = (json as any)?.errors?.[0]?.message as string | undefined
            setError({
              message: validationMessage || apiMessage || 'Something went wrong.',
              status: String((json as any)?.status || res.status),
            })
            return
          }

          setAlreadySubscribed(false)
          setHasSubmitted(true)
        })
        .catch(() => {
          clearTimeout(loadingTimer)
          setIsLoading(false)
          setError({ message: 'Something went wrong.' })
        })
    },
    [email, formID],
  )

  return (
    <section className="max-w-[1280px] container px-4 py-16">
      <div className="bg-primary rounded-4xl p-10 md:p-16 relative overflow-hidden text-center md:text-left">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              {title}
            </h2>
            {description && <p className="text-white/80 text-lg">{description}</p>}
          </div>
          <div className="w-full max-w-md">
            {hasSubmitted ? (
              alreadySubscribed ? (
                <p className="text-white/90 text-sm text-center sm:text-left">
                  You’re already subscribed with this email. We’ve kept your preferences.
                </p>
              ) : confirmationType === 'message' && confirmationMessage ? (
                <RichText
                  data={confirmationMessage}
                  enableGutter={false}
                  className="mx-0 max-w-none text-white/90 prose prose-invert md:prose-md [&_a]:text-white [&_a]:underline"
                />
              ) : (
                <p className="text-white/90 text-sm text-center sm:text-left">
                  Thanks for subscribing! We’ve recorded your email.
                </p>
              )
            ) : (
              <>
                {error && (
                  <p className="text-red-100 text-sm mb-4 text-center sm:text-left">
                    {error.message}
                  </p>
                )}
                <form className="flex flex-col sm:flex-row gap-3" onSubmit={onSubmit}>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    className="grow rounded-full border-none px-6 py-4 focus:ring-2 focus:ring-white placeholder:text-slate-400 text-slate-900 outline-none bg-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-slate-900 text-white font-bold px-8 py-4 rounded-full hover:bg-slate-800 transition-all disabled:opacity-70 shrink-0"
                  >
                    {isLoading ? '...' : submitButtonLabel}
                  </button>
                </form>
                <p className="text-white/60 text-xs mt-3 text-center sm:text-left">
                  By subscribing, you agree to our privacy policy.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="absolute -top-24 -right-24 size-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 size-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </section>
  )
}
