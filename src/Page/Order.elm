module Page.Order exposing (render)

import Material.Options as Options exposing (when, css, div)
import Material.Elevation as Elevation
import Material.Color as Color
import Material.Typography as Typography
import Material.Card as Card
import Material.Button as Button
import Material.Textfield as Textfield
import Material.Spinner as Spinner
import Material.Table as Table

import Markdown
import Html exposing (Html, text, p)
import Types exposing (Msg, Model, Mdl)
import Generics exposing (..)

backgroundImage : Html Msg
backgroundImage =
  Options.stylesheet
    """
      body {
        background-image: url("order-background.svg");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: top;
      }
    """

getFullOption : String -> String
getFullOption option_ =
  case option_ of
    "format" ->
        "Eiusmod tempor incididunt"
    "programProblem" ->
        "Eiusmod tempor incididunt"
    "trollProblem" ->
        "Eiusmod tempor incididunt"
    "startupProblem" ->
        "Eiusmod tempor incididunt"
    "lostFiles" ->
        "Eiusmod tempor incididunt"
    "slowProblem" ->
        "Eiusmod tempor incididunt"
    "newProgram" ->
        "Eiusmod tempor incididunt"
    "backup" ->
        "Eiusmod tempor incididunt"
    "virus" ->
        "Eiusmod tempor incididunt"
    "help" ->
        "Eiusmod tempor incididunt"
    "lawyer" ->
        "Eiusmod tempor incididunt"
    "development" ->
        "Eiusmod tempor incididunt"
    _ ->
       "Eiusmod tempor incididunt"

inputOrderCard : Model -> Html Msg
inputOrderCard model =
  Card.view
    [ Elevation.e4
    , Options.many
        [ css "margin" "8px"
        , css "width" "auto"
        ] |>
        when (model.viewport == Types.Phone)
    ]
    [ Card.title []
        [ Card.head
            [ Color.text Color.accent
            , css "margin-left" "auto"
            , css "margin-right" "auto"
            ]
            [ text "Entre com a sua senha" ]
        , Card.subhead
            [ css "margin-left" "auto"
            , css "margin-right" "auto"
            ]
            [ text "Lorem ipsum dolor sit amet" ]
        ]
    , Card.text
        [ Options.center
        , css "flex-direction" "column"
        ]
        [ Textfield.render Mdl [2] model.mdl
            [ Textfield.maxlength 5
            , Textfield.disabled |>
                when model.pages.order.loadingOrder
            , Options.onInput
                (\id_ -> Types.LoadOrderOrderPage id_)
            ] []
        , Spinner.spinner
            [ Spinner.active
                model.pages.order.loadingOrder
            ]
        , ( if
              ( not model.pages.order.loadingOrder &&
                model.pages.order.result.status == "error"
              )
            then
              errorView model
            else if
              ( not model.pages.order.loadingOrder &&
                model.pages.order.result.status == "unavailable"
              )
            then
              Options.styled p
                [ Typography.body2
                , Color.text <| Color.color Color.Red Color.S500
                ]
                [ text "Este número de pedido é inválido." ]
            else
              text ""
          )
        ]
    ]

errorView : Model -> Html Msg
errorView model =
  div
    [ Options.center
    , css "flex-direction" "column"
    ]
    [ Options.styled p
        [ Typography.body2
        , Color.text <| Color.color Color.Red Color.S500
        ]
        [ text "Ops! Parece que ocorreu um problema de conexão." ]
    , Button.render Mdl [40] model.mdl
        [ Button.ripple
        , Button.raised
        , Options.onClick
          <| Types.LoadOrderOrderPage model.pages.order.id
        , css "margin-top" "4px"
        , css "margin-bottom" "16px"
        ]
        [ text "Tentar novamente" ]
    ]

resultCard : Model -> Html Msg
resultCard model =
  Card.view
    [ Elevation.e4
    , css "width" "auto"
    , css "margin" "8px"
        |> when (model.viewport == Types.Phone)
    , css "margin-top" "40px"
        |> when (model.viewport /= Types.Phone)
    ]
    [ Card.title []
        [ Card.head
            [ Color.text Color.accent
            , css "margin-left" "auto"
            , css "margin-right" "auto"
            ]
            [ text "Informações do pedido" ]
        ]
    , Card.text
        [ Options.center ]
            ( let
                order_ = model.pages.order.result.order
              in
                [ Table.table
                    [ css "border" "none"
                    , css "white-space" "initial"
                        |> when (model.viewport == Types.Phone)
                    ]
                    [ Table.tbody []
                        [ Table.tr []
                            [ Table.th
                                [ css "vertical-align" "middle"
                                , css "padding" "12px 18px"
                                ]
                                [ text "Pedido" ]
                            , Table.td
                                [ css "border-top" "none"
                                , css "border-bottom" "none"
                                ]
                                [ text <| getFullOption order_.option ]
                            ]
                        , Table.tr []
                            [ Table.th
                                [ css "vertical-align" "middle"
                                , css "padding" "12px 18px"
                                ]
                                [ text "Nº do pedido" ]
                            , Table.td
                                [ css "border-top" "none"
                                , css "border-bottom" "none"
                                ]
                                [ Options.styled Html.span
                                    [ Color.text Color.primary ]
                                    [ text order_.id ]
                                ]
                            ]
                        , Table.tr []
                            [ Table.th
                                [ css "vertical-align" "middle"
                                , css "padding" "12px 18px"
                                ]
                                [ text "Custo" ]
                            , Table.td
                                [ css "border-top" "none"
                                , css "border-bottom" "none"
                                ]
                                [ text ("R$ " ++ (toString order_.price) ++ ",00") ]
                            ]
                        , Table.tr []
                            [ Table.th
                                [ css "vertical-align" "middle"
                                , css "padding" "12px 18px"
                                ]
                                [ text "Situação" ]
                            , Table.td
                                [ css "border-top" "none"
                                , css "border-bottom" "none"
                                ]
                                [ text order_.status ]
                            ]
                        , Table.tr []
                            [ Table.th
                                [ css "vertical-align" "middle"
                                , css "padding" "12px 18px"
                                ]
                                [ text "Prazo de entrega" ]
                            , Table.td
                                [ css "border-top" "none"
                                , css "border-bottom" "none"
                                ]
                                [ text
                                    ( if order_.delivery == 0 then
                                        "No encontro"
                                      else
                                        (toString order_.delivery) ++
                                        (if order_.delivery == 1 then " dia" else " dias") ++
                                        " (à partir da data da entrega)"
                                    )
                                ]
                            ]
                        , Table.tr []
                            [ Table.th
                                [ css "vertical-align" "middle"
                                , css "padding" "12px 18px"
                                ]
                                [ text "Cliente" ]
                            , Table.td
                                [ css "border-top" "none"
                                , css "border-bottom" "none"
                                ]
                                [ text order_.name ]
                            ]
                        , Table.tr []
                            [ Table.th
                                [ css "vertical-align" "middle"
                                , css "padding" "12px 18px"
                                ]
                                [ text "Celular" ]
                            , Table.td
                                [ css "border-top" "none"
                                , css "border-bottom" "none"
                                ]
                                [ text order_.phone ]
                            ]
                        , Table.tr []
                            [ Table.th
                                [ css "vertical-align" "middle"
                                , css "padding" "12px 18px"
                                ]
                                [ text "Local de encontro" ]
                            , Table.td
                                [ css "border-top" "none"
                                , css "border-bottom" "none"
                                ]
                                [ text order_.place ]
                            ]
                        , Table.tr []
                            [ Table.th
                                [ css "vertical-align" "middle"
                                , css "padding" "12px 18px"
                                ]
                                [ text "Endereço" ]
                            , Table.td
                                [ css "border-top" "none"
                                , css "border-bottom" "none"
                                ]
                                [ text order_.address ]
                            ]
                        , Table.tr []
                            [ Table.th
                                [ css "vertical-align" "middle"
                                , css "padding" "12px 18px"
                                ]
                                [ text "Data do encontro" ]
                            , Table.td
                                [ css "border-top" "none"
                                , css "border-bottom" "none"
                                ]
                                [ text
                                    ( "Dia " ++ toString order_.date.monthday ++
                                      " de " ++ monthToString order_.date.month ++
                                      " de " ++ toString order_.date.year ++
                                      ", " ++ weekdayToString order_.date.weekday
                                    )
                                ]
                            ]
                        ]
                    ]
                ]
            )
    , Card.text []
        [ Markdown.toHtml [] "**OBS:** Eiusmod tempor incididunt." ]
    , Card.actions
        [ Card.border ]
        [ Button.render Mdl [98] model.mdl
            [ Button.accent
            , Button.ripple
            , Options.onClick Types.RestartOrderPage
            ]
            [ text "Ok" ]
        ]
    ]

render : Model -> Html Msg
render model =
  div
    [ Options.many
        [ css "display" "flex"
        , css "align-items" "center"
        , css "justify-content" "center"
        , css "width" "100%"
        , css "height" "100%"
        , css "position" "absolute"
            |> when (model.pages.order.result.status /= "ok")
        ] |> when
            ( model.viewport == Types.Tablet ||
              model.viewport == Types.Desktop
            )
    ]
    [ backgroundImage
    , ( if model.pages.order.result.status == "ok" then
          resultCard model
        else
          inputOrderCard model
      )
    ]