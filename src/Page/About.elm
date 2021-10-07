module Page.About exposing (..)

import Material.Options as Options exposing (when, css, div)
import Material.Color as Color
import Material.Elevation as Elevation
import Material.Typography as Typography
import Material.List as List
import Material.Card as Card

import Html exposing (Html, text)
import Markdown
import Types exposing (Model, Msg)

backgroundImage : Html Msg
backgroundImage =
  Options.stylesheet
    """
      body {
        background-image: url("about-background.svg");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: top;
      }
    """

render : Model -> Html Msg
render model =
  div []
    [ backgroundImage
    , div
        [ css "margin"
            ( if model.viewport == Types.Desktop then
                "40px"
              else
                "16px"
            )
        , css "max-width" "640px"
        ]
        [ Card.view
            [ css "width" "100%"
            , Elevation.e8
            ]
            [ Card.title []
                [ Card.head
                    [ Color.text Color.accent ]
                    [ text "Lorem ipsum dolor sit amet?" ]
                ]
            , Card.text
                [ css "text-align" "justify"
                , css "width" "auto"
                ]
                [ Markdown.toHtml []
                    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."""
                ]
            , Card.title []
                [ Card.head
                    [ Color.text Color.accent ]
                    [ text "Lorem ipsum dolor sit amet" ]
                ]
            , Card.text
                [ css "text-align" "justify"
                , css "width" "auto"
                ]
                [ Markdown.toHtml []
                    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."""
                ]
            , Card.text
                [ css "text-align" "justify"
                , css "width" "auto"
                ]
                [ Markdown.toHtml []
                    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."""
                ]
            , Card.title []
                [ Card.head
                    [ Color.text Color.accent ]
                    [ text "Lorem ipsum dolor sit amet" ]
                ]
            , Card.text
                [ css "text-align" "justify"
                , css "width" "auto"
                ]
                [ Markdown.toHtml []
                    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."""
                ]
            , Card.title []
                [ Card.head
                    [ Color.text Color.accent ]
                    [ text "Lorem ipsum dolor sit amet" ]
                ]
            , Card.text
                [ css "text-align" "justify"
                , css "width" "auto"
                ]
                [ Markdown.toHtml []
                    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."""
                ]
            , Card.media
                [ Color.background <| Color.color Color.Grey Color.S100
                , css "margin-top" "16px"
                ]
                [ List.li
                    [ List.withBody |>
                        when (model.viewport == Types.Tablet || model.viewport == Types.Desktop)
                    ]
                    [ List.content []
                        [ List.avatarImage "adware.png" []
                        , text "Enviado por Anônimo"
                        , List.body
                            [ css "display" "none" |> when (model.viewport == Types.Phone) ]
                            [ text
                                """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."""
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
