// App-wide toast API, backed by react-hot-toast through notify.
import { notify } from '@/components/ui/toast-config'

export const toast = {
  success: (message: string) => notify.success(message),
  error: (message: string) => notify.error(message),
  warning: (message: string) => notify.warning(message),
  info: (message: string) => notify.info(message),
  loading: (message: string) => notify.loading(message),
  dismiss: (id?: string) => notify.dismiss(id)
}
