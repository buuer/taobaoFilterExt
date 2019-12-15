import { utils, renderBlockInput } from './utils'

function main() {
  const initBlockKey = utils.blockValInit()
  utils
    .storageGet('isFold')
    .then((setting = {}) => {
      const blockEl = renderBlockInput(initBlockKey, setting.isFold)

      blockEl.addEventListener('input', () =>
        utils.callWithErrorLog(() => {
          const searchKey = utils.getSearchKey()
          const blockKey = utils.getBlockKey()
          const searchWithBlock = utils.searchWithBlock(blockKey, searchKey)
          utils.setSearchKey(searchWithBlock)
        })
      )

      blockEl.addEventListener('click', ev => {
        if (!ev.target.classList.contains('block-key-fold-toggle')) return

        ev.stopPropagation()
        ev.preventDefault()
        blockEl.classList.toggle('block-key-fold')
        const isFold = blockEl.classList.contains('block-key-fold')
        utils.storageSet({ isFold })
      })

      blockEl.addEventListener('keydown', ev => {
        if (ev.keyCode === 13) {
          document.querySelector('.search button[type=submit]').click()
        }
      })
    })
    .catch(e => {
      console.error(e)
    })
}

utils.ready(() => utils.callWithErrorLog(main))
