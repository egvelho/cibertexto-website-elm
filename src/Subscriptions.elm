module Subscriptions exposing (subscriptions)

import Time exposing (second)
import Window
import Material
import Material.Menu as Menu
import Types exposing (Model, Msg, Mdl)

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.batch
    [ Material.subscriptions Mdl model
    , Menu.subs Mdl model.mdl
    , Window.resizes Types.UpdateViewport
    , Time.every (second * 8) Types.UpdateBannerHomePage
    ]
