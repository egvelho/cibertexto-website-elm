module Page.Development exposing (render)

import Material.Options as Options exposing (when, css, img, div)
import Material.Color as Color
import Material.Typography as Typography
import Material.Elevation as Elevation
import Material.Grid as Grid exposing (grid, cell, Device(..))
import Material.Button as Button
import Material.Card as Card
import Material.List as List

import Html exposing (Html, text)
import Html.Attributes exposing (src)

import Markdown
import Types exposing (Msg, Model, Mdl)

headerTitle : Model -> Html Msg
headerTitle model =
  Options.styled
    ( case model.viewport of
        Types.Phone ->
          Html.h3
        Types.Tablet ->
          Html.h2
        Types.Desktop ->
          Html.h1
    )
    [ css "text-align" "center" ]
    [ text "Criação de sites e aplicativos para celular" ]

headerAbout : Model -> Html Msg
headerAbout model =
  List.ul []
    [ List.li []
        [ List.content []
            [ List.avatarImage "e-commerce.png" []
            , text "Lojas virtuais"
            ]
        ]
    , List.li []
        [ List.content []
            [ List.avatarImage "catalogs.png" []
            , text "Catálogos de produtos online"
            ]
        ]
    , List.li []
        [ List.content []
            [ List.avatarImage "kitchen.png" []
            , text "Aplicativos para restaurantes"
            ]
        ]
    , List.li []
        [ List.content []
            [ List.avatarImage "checked.png" []
            , text "O que você precisar!"
            ]
        ]
    ]

headerBenefits : Model -> Html Msg
headerBenefits model =
  List.ul []
    [ List.li []
        [ List.content []
            [ List.avatarImage "search.png" []
            , text "Otimização SEO"
            ]
        ]
    , List.li []
        [ List.content []
            [ List.avatarImage "share.png" []
            , text "Conexão com redes sociais"
            ]
        ]
    , List.li []
        [ List.content []
            [ List.avatarImage "startup.png" []
            , text "Hospedagem e suporte"
            ]
        ]
    ]

headerContact : Model -> Html Msg
headerContact model =
  Card.view
    [ Elevation.e4
    , css "width" "100%"
    , css "max-width" "330px"
        |> when
            ( model.viewport == Types.Desktop ||
              model.viewport == Types.Tablet
            )
    ]
    [ Card.title []
        [ Card.head []
            [ text "Entre em contato!" ]
        , Card.subhead []
            [ text
                """Vamos avaliar seu negócio e
                apresentar para você uma solução
                em software extremamente elegante."""
            ]
        ]
    , Card.actions
        [ Card.border ]
        [ Button.render Mdl [1] model.mdl
            [ Button.ripple
            , Button.accent
            , Options.onClick <| Types.SelectOrderSchedulePage Types.DevelopmentOrder
            ]
            [ text "Agende uma reunião" ]
        ]
    ]

subHeader : Model -> Html Msg
subHeader model =
  div
    [ css "background-image" "url(\"dev-background.svg\")"
    , css "background-size" "cover"
    , css "background-repeat" "no-repeat"
    , css "background-position" "top"
    , css "padding-bottom" "90px" |>
        when
          ( model.viewport == Types.Tablet ||
            model.viewport == Types.Phone
          )
    , css "height" "800px" |>
        when (model.viewport == Types.Desktop)
    ]
    [ grid
        [ Options.many
            [ css "margin-left" "40px"
            , css "margin-right" "40px"
            ]
          |> when ( model.viewport == Types.Desktop )
        ]
        [ cell
            [ Grid.size All 12
            , Grid.align Grid.Middle
            , Options.center
            ]
            [ headerTitle model ]
        , cell
            [ Grid.size All 12
            , Grid.size Desktop 6
            , Options.center
            ]
            [ headerAbout model ]
        , cell
            [ Grid.size All 12
            , Grid.size Desktop 6
            , Options.center
            , css "flex-direction"
                ( case model.viewport of
                    Types.Desktop ->
                      "column"
                    Types.Tablet ->
                      "row"
                    Types.Phone ->
                      "column"
                )
            ]
            [ headerBenefits model
            , headerContact model
            ]
        ]
    ]

infoCard : Model -> String -> String -> String -> Color.Color -> Html Msg
infoCard model title_ text_ image_ color_ =
  Card.view
    [ Elevation.e8
    , css "width" "100%"
    , css "height" "100%"
    ]
    [ Card.media
        [ Color.background color_ ]
        [ div
            [ Options.center
            , css "margin" "16px 0"
            ]
            [ img
                [ Options.attribute <| src image_
                , css "height" "128px"
                ] []
            ]
        ]
    , Card.title []
        [ Card.head
            [ Color.text Color.accent ]
            [ text title_ ]
        ]
    , Card.text
        [ css "text-align" "justify"
        , css "width" "auto"
        ]
        [ Markdown.toHtml [] text_ ]
    ]

materialDesignCard : Model -> Html Msg
materialDesignCard model =
  infoCard model
    "Material Design"
    """É o **estado da arte** em termos de design de interfaces.
    Tudo o que desenvolvemos utiliza esta linguagem de design da
    **Google**. Linguagem esta que busca garantir a melhor
    **usabilidade** para seu site ou aplicativo. Além de,
    é claro, possuir um **visual moderno e profissional**."""
    "material-design.svg"
    (Color.color Color.Teal Color.S500)

lambdaCard : Model -> Html Msg
lambdaCard model =
  infoCard model
    "O poder do lambda"
    """Não é à toa que o símbolo matemático lambda integra
    o logo da Cibertexto Tecnologia! Nós utilizamos **as tecnologias mais
    avançadas para desenvolver seu site ou aplicativo**. Isto
    inclui a utilização do paradigma funcional, uma forma
    de criar programas de computador que segue princípios
    da matemática para garantir **alta performance e
    confiabilidade** em nossos produtos."""
    "lambda.svg"
    (Color.color Color.Indigo Color.S500)

mobileFirstCard : Model -> Html Msg
mobileFirstCard model =
  infoCard model
    "Mobile First"
    """Viu como este site se adaptou perfeitamente na tela
    do seu celular? Isto é porque **pensamos primeiro nos
    celulares** para desenvolvê-lo. É justamente disso que
    o Mobile First se trata: **focar no que todo mundo usa**,
    onde as pessoas estão. Criar pensando nas telas dos
    celulares e então adaptá-las para as telas dos
    computadores."""
    "mobile-first.svg"
    (Color.color Color.Pink Color.S500)

render : Model -> Html Msg
render model =
  div []
    [ subHeader model
    , grid
        [ css "margin-top" "-90px" ]
        [ cell [ Grid.size All 12, Grid.size Desktop 4 ]
            [ materialDesignCard model ]
        , cell [ Grid.size All 12, Grid.size Desktop 4 ]
            [ mobileFirstCard model ]
        , cell [ Grid.size All 12, Grid.size Desktop 4 ]
            [ lambdaCard model ]
        ]
    ]