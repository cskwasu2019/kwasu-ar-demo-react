import React, { useCallback } from 'react'
import { createAsset } from 'use-asset'
import Wikipedia from 'wikipedia'
import Card from './Card'

const WIKI_PAGE = 'Kwara_State_University'

let wikiPromise
const getWikiPromise = () => {
  if (!wikiPromise) {
    wikiPromise = Wikipedia(WIKI_PAGE)
  }
  return wikiPromise
}

const contentLoader = createAsset(async () => {
  const page = await getWikiPromise()

  const content = await page.content()
  // get the first two paragraphs
  return content.split(/\n+/).slice(0, 2).join('<br>')
})

const infoLoader = createAsset(async () => {
  const page = await getWikiPromise()

  const infoBox = await page.infobox()

  // split details into two sections
  const details = Object.keys(infoBox).reduce(
    (obj, key) => {
      const k = /\d+/.test(infoBox[key]) ? 'figures' : 'texts'

      return {
        ...obj,
        [k]: [...obj[k], [key, infoBox[key]]],
      }
    },
    {
      figures: [],
      texts: [],
    }
  )
  return details
})

const HomeDetails = () => {
  const aboutResource = useCallback(() => contentLoader.read(), [])
  const infoResource = useCallback(() => infoLoader.read(), [])

  return (
    <>
      <Card
        resource={aboutResource}
        title="About School"
        errorFallback={
          <span className="m-auto uppercase text-red-600 text-sm">
            Failed to fetch content
          </span>
        }
      >
        {(data) => (
          <p className="text-sm" dangerouslySetInnerHTML={{ __html: data }}></p>
        )}
      </Card>
      <Card
        resource={infoResource}
        title="Information"
        errorFallback={
          <span className="m-auto uppercase text-red-600 text-sm">
            Failed to fetch School Information
          </span>
        }
      >
        {(data) => (
          <table className="w-full h-full mx-auto text-sm lg:text-base">
            <tbody>
              {new Array(Math.max(data.figures.length, data.texts.length))
                .fill(null)
                .map((_, index) => (
                  <tr key={index} className="even:bg-grey-100 odd:bg-grey-50">
                    {index < data.texts.length ? (
                      <td className="text-right w-6/12 align-text-top p-1">
                        <span className="uppercase font-bold">
                          {data.texts[index][0]}
                        </span>
                        <br />
                        <span className="text-grey-600">
                          {data.texts[index][1]}
                        </span>{' '}
                      </td>
                    ) : (
                      <td></td>
                    )}

                    {index < data.figures.length ? (
                      <td className="w-6/12 align-text-top p-1">
                        <span className="uppercase text-sm font-bold">
                          {data.figures[index][0]}
                        </span>
                        <br />
                        <span className="text-grey-600 lg:text-lg">
                          {data.figures[index][1]}
                        </span>
                      </td>
                    ) : (
                      <td></td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  )
}

export default HomeDetails
