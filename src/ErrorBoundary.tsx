import { Component, type ErrorInfo, type ReactNode } from 'react'
import type { Lang } from './i18n'
import Mi from './Mi'

interface Props {
  lang: Lang
  children: ReactNode
}

interface State {
  failed: boolean
}

const COPY: Record<Lang, { title: string; body: string; retry: string }> = {
  ar: { title: 'تعذر تحميل هذا القسم', body: 'حدث خطأ غير متوقع. أعد تحميل الصفحة، أو ارجع إلى الرئيسية.', retry: 'إعادة تحميل الصفحة' },
  fr: { title: 'Cette rubrique ne peut pas être affichée', body: 'Une erreur inattendue est survenue. Rechargez la page ou revenez à l’accueil.', retry: 'Recharger la page' },
  en: { title: 'This section could not be displayed', body: 'An unexpected error occurred. Reload the page or return to the home page.', retry: 'Reload page' },
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Qalam page error:', error, info.componentStack)
  }

  render() {
    if (this.state.failed) {
      const copy = COPY[this.props.lang]
      return (
        <section className="page error-boundary" role="alert">
          <Mi name="error_outline" />
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div>
            <button className="primary-btn small" onClick={() => window.location.reload()}>{copy.retry}</button>
            <a className="ghost-btn small" href="#/">{this.props.lang === 'ar' ? 'الرئيسية' : this.props.lang === 'fr' ? 'Accueil' : 'Home'}</a>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}
