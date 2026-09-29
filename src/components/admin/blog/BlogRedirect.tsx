import { redirect } from 'next/navigation'

/** As listas de matérias e posts-us vivem juntas em /admin/blog. */
export function BlogRedirect() {
  redirect('/admin/blog')
}
