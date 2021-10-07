module View.Header exposing (render)

import Html exposing (Html, text)
import Html.Attributes exposing (src)

import Material.Layout as Layout
import Material.Options as Options exposing (css, img)
import Material.Menu as Menu

import Types exposing (Model, Msg, Mdl)

whatsappIcon : Html Msg
whatsappIcon =
  Options.stylesheet
    """
      #whatsapp-menu > button {
        background-image: url("whatsapp.svg");
        background-size: cover;
        background-repeat: no-repeat;
      }

      #whatsapp-menu i {
        display: none;
      }
    """

render : Model -> List(Html Msg)
render model =
  [ Layout.row
      [ css "background-color" "#efefef"
      , css "display" "flex"
      , css "justify-content" "space-between"
      ]
      [ img
          [ Options.attribute <| src "logo-black.svg"
          , css "height"
              ( if model.viewport == Types.Phone then
                  "24px"
                else
                  "36px"
              )
          ] []
      , whatsappIcon
      , Menu.render Mdl [30] model.mdl
          [ Menu.bottomRight
          , Options.id "whatsapp-menu"
          ]
          [ Menu.item [] [ text "(XX) XXXXX-XXXX" ] ]
      ]
  ]
