module View.Drawer exposing (render)

import Html exposing (Html, text)
import Html.Attributes as Attributes

import Material.Options as Options exposing (when, img, css)
import Material.Layout as Layout exposing (link, href)
import Material.Menu as Menu

import Generics exposing (onClickPreventDefault)
import Types exposing (Model, Msg)

clickItem : String -> Model -> Options.Property a Msg
clickItem link_ model =
  onClickPreventDefault <| Types.ClickDrawerItem link_

drawerItem : String -> String -> String -> Model -> Html Msg
drawerItem link_ text_ img_ model =
  link
    [ href link_
    , clickItem link_ model
    , css "display" "flex"
    , css "flex-direction" "row"
    , css "align-items" "center"
    , css "flex-grow" "2"
    , css "order" "0"
    ]
    [ img [ Options.attribute <| Attributes.src img_
          , css "width" "32px"
          , css "height" "32px"
          , css "border-radius" "50%"
          , css "margin-right" "16px"
          ] []
    , text text_
    ]

render : Model -> List(Html Msg)
render model =
  [ Layout.title
      [ Options.center
      , css "padding" "16px 0"
      , css "margin-bottom" "16px"
      , css "background-image" "linear-gradient(-225deg, #2CD8D5 0%, #C5C1FF 56%, #FFBAC3 100%)"
      ]
      [ img
          [ Options.attribute <| Attributes.src "logo-simple.svg"
          , css "width" "96px"
          ] []
      ]
  , Layout.navigation []
      [ Layout.spacer
      , drawerItem "#/home" "Lorem ipsum" "home.png" model
      , drawerItem "#/assistencia" "Lorem ipsum" "help.png" model
      , drawerItem "#/andamento" "Lorem ipsum" "clock.png" model
      , drawerItem "#/advogados" "Lorem ipsum" "lawyer.png" model
      , drawerItem "#/dev" "Lorem ipsum" "code.png" model 
      , drawerItem "#/sobre" "Lorem ipsum" "document.png" model
      ]
  ]
