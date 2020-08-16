module Page.Lawyers exposing (render)

import Material.Options as Options exposing (when, css, div, img)
import Material.Color as Color
import Material.Elevation as Elevation
import Material.Typography as Typography
import Material.Grid as Grid exposing (grid, cell, Device(..), Align(..))
import Material.Button as Button
import Material.Card as Card

import Html exposing (Html, text, p)
import Html.Attributes exposing (src)

import Markdown
import Types exposing (Model, Msg, Mdl)

subHeader : Model -> Html Msg
subHeader model =
  grid
    [ css "height" "512px"
    , css "padding" "0 40px"
    , Color.background Color.black
    , Grid.noSpacing
    ]
    [ cell
        [ Grid.size Desktop 8
        , Grid.size Tablet 12
        , Grid.size Phone 12
        , Grid.order Phone 2
        , Grid.order Tablet 2
        , Grid.align Middle
        ]
        [ Options.styled Html.h1
            [ Color.text Color.white
            , css "text-align" "center"
            , Typography.headline |> when
                (model.viewport == Types.Tablet || model.viewport == Types.Phone)
            ]
            [ text "Auxílio técnico para advogados" ]
        ]
    , cell
        [ Grid.size Desktop 4
        , Grid.size Tablet 12
        , Grid.size Phone 12
        , Grid.order Phone 1
        , Grid.order Tablet 1
        , Grid.align Middle
        ]
        [ div
            [ css "height" "256px"
            , Options.center
            ]
            [ img
              [ Options.attribute <| src "scales.svg"
              , css "height" "100%"
              ] []
            ]
        ]
    ]

accessHelpCard : Model -> Html Msg
accessHelpCard model =
  Card.view
    [ Elevation.e8
    , css "width" "100%"
    , css "height" "100%"
    ]
    [ Card.title []
        [ Card.head
            [ Color.text Color.accent ]
            [ text "Um problema de transição" ] ]
    , Card.text
        [ css "text-align" "justify"
        , css "width" "auto"
        ]
        [ Markdown.toHtml []
            """Como já está sendo dito há algum tempo,
            estamos na **"era do processo eletrônico"**.
            Desta forma, a partir de seus computadores
            pessoais, advogados e outros profissionais
            da área jurídica acessam serviços
            governamentais através da internet."""
        ]
    , Card.text
        [ css "text-align" "justify"
        , css "width" "auto"
        ]
        [ Markdown.toHtml []
            """Para realizar este acesso geralmente é
            necessário que se instalem programas adicionais
            que servem para, em teoria, aumentar a segurança
            da conexão entre o computador do advogado e o
            serviço que se deseja acessar. Além destes programas,
            também é necessário o **token**, que é um dispositivo de
            armazenamento que guarda o Certificado Digital
            utilizado para autenticar o acesso."""
        ]
    , Card.text
        [ css "text-align" "justify"
        , css "width" "auto"
        ]
        [ Markdown.toHtml []
            """Porém, existe uma série de burocracias que são
            necessárias entre estes passos. Por exemplo, para
            submeter uma petição ao PJE, é preciso que os 
            arquivos anexados estejam no formato PDF-A. Para
            criar um arquivo desses à partir de um documento
            escaneado, é necessário instalar um programa adicional.
            **Isso não é intuitivo!**"""
        ]
    , Card.text
        [ css "text-align" "justify"
        , css "width" "auto"
        ]
        [ Markdown.toHtml []
            """Ou ainda, alguns serviços precisam de um navegador
            de internet especial para acessá-los. Como é o caso do
            TJRS Browser. Estes navegadores geralmente são versões
            modificadas do Mozilla Firefox pré-configuradas para
            realizar o acesso à estes serviços. Novamente, **isso
            tudo é muito complicado e suscetível à falhas!**"""
        ]
    , Card.text
        [ css "text-align" "justify"
        , css "width" "auto"
        ]
        [ Markdown.toHtml []
            """O que nós queremos dizer com este texto, é que sabemos
            que os juristas estão passando por um momento de transição.
            **A Cibertexto Tecnologia pode orientá-lo durante estas mudanças.**"""
        ]
    ]

promoCard : Model -> Html Msg
promoCard model =
  Card.view
    [ Elevation.e8
    , css "width" "100%"
    , css "height" "100%"
    ]
    [ Card.media
        [ Color.background <| Color.color Color.Indigo Color.S500 ]
        [ div
            [ Options.center
            , css "margin" "16px 0"
            ]
            [ img
                [ Options.attribute <| src "lock.svg"
                , css "height" "128px"
                ] []
            ]
        ]
    , Card.title
        [ css "flex" "1" ]
        [ Card.head
            [ Color.text Color.accent ]
            [ text "Consultoria sobre sigilo e segurança" ]
        , Card.subhead []
            [ text
                """Que tal um pouco de criptografia?
                Entre em contato para aprender a proteger
                as informações pessoais dos seus clientes."""
            ]
        ]
    , Card.actions [ Card.border ]
        [ Button.render Mdl [0] model.mdl
            [ Button.accent
            , Button.ripple
            , Options.onClick <| Types.SelectOrderSchedulePage Types.LawyerOrder
            ]
            [ text "Agendar uma reunião" ]
        ]
    ]

privacyInfoCard : Model -> Html Msg
privacyInfoCard model =
  Card.view
    [ Elevation.e8
    , css "width" "100%"
    , css "height" "100%"
    ]
    [ Card.media
        [ Color.background <| Color.color Color.Pink Color.A200 ]
        [ div
            [ css "margin-top" "32px"
            , css "margin-left" "16px"
            ]
            [ img
                [ Options.attribute <| src "support.svg"
                , css "height" "128px"
                ] []
            ]
        ]
    , Card.title
        [ css "flex" "1" ]
        [ Card.head
            [ Color.text Color.accent ]
            [ text "Auxílio técnico" ]
        , Card.subhead []
            [ text
                """Visitamos você em seu escritório
                para auxiliá-lo com as devidas questões
                técnicas."""
            ]
        ]
    , Card.text []
        [ Options.styled Html.h2
            [ Typography.display1 ]
            [ text "R$ 90,00" ]
        ]
    , Card.actions [ Card.border ]
        [ Button.render Mdl [1] model.mdl
            [ Button.accent
            , Button.ripple
            ]
            [ text "Solicite" ]
        ]
    ]

render : Model -> Html Msg
render model =
  div []
    [ subHeader model
    , grid
        [ Grid.maxWidth "900px"
        , css "margin-top" "-90px" |> when (model.viewport == Types.Desktop)
        ]
        [ cell
            [ Grid.size All 12
            , Grid.size Desktop 8
            , Grid.order Phone 2
            , Grid.order Tablet 2
            , css "margin-top" "-8px" |>
                when
                  ( model.viewport == Types.Tablet ||
                    model.viewport == Types.Phone
                  )
            ]
            [ accessHelpCard model ]
        , cell
            [ Grid.size All 12
            , Grid.size Desktop 4
            , Grid.order Phone 1
            , Grid.order Tablet 1
            , Grid.stretch
            ]
            [ grid
                [ Grid.noSpacing |>
                    when (model.viewport == Types.Desktop)
                , css "margin" "-16px -16px 0 -16px" |>
                    when
                      ( model.viewport == Types.Tablet ||
                        model.viewport == Types.Phone
                      )
                , css "height" "100%"
                ]
                [ cell
                    [ Grid.size Desktop 12
                    , Grid.stretch
                    , css "margin-bottom" "16px" |>
                        when (model.viewport == Types.Desktop)
                    ]
                    [ promoCard model ]
                , cell
                    [ Grid.size Desktop 12
                    , Grid.stretch
                    ]
                    [ privacyInfoCard model ]
                ]
            ]
        ]
    ]
