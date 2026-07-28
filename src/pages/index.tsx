import React from 'react'
import {Redirect} from '@docusaurus/router'
import useBaseUrl from '@docusaurus/useBaseUrl'

export default function Home(): React.JSX.Element {
  const docsUrl = useBaseUrl('/docs/')

  return <Redirect to={docsUrl} />
}
