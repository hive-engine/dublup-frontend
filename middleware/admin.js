export default function ({ route, store, redirect }) {
  // If the user is not authenticated
  if (!store.state.user.authenticated && !store.state.user.admin) {
    return redirect('/')
  }
}
