module Page.Home exposing (render)

import Html exposing (Html, text)
import Html.Attributes exposing (style, src)

import Material.Options as Options exposing (when, css, div, img)
import Material.Color as Color exposing (Color)
import Material.Elevation as Elevation
import Material.Typography as Typography
import Material.Grid as Grid exposing (grid, cell, size, stretch, Device(..))
import Material.Button as Button
import Material.Card as Card
import Material.Tabs as Tabs

import Markdown
import Types exposing (Model, Msg, Mdl)
import Route

-- BANNER


bannerCard : Model -> String -> List(String) -> String -> String -> Color -> Html Msg
bannerCard model title text_ link_ img_ bgColor_ =
  Card.view
    [ Elevation.e8
    , Color.background bgColor_
    , css "width" "auto"
    , css "padding"
        ( case model.viewport of
            Types.Desktop -> "16px 64px"
            _ -> "16px"
        )
    , css "height"
        ( case model.viewport of
            Types.Desktop -> "384px"
            Types.Tablet -> "256px"
            Types.Phone -> "512px"
        )
    , ( case model.viewport of
        Types.Phone -> 
          Options.many
            [ css "flex-direction" "column"
            , css "justify-content" "center"
            ]
        _ ->
          Options.many
            [ css "flex-direction" "row"
            , css "align-items" "center"
            ]
      )
    ]
    [ Card.media
        [ Color.background bgColor_
        , Options.center
        , css "margin-right" "64px" |> Options.when (model.viewport == Types.Desktop)
        ]
    [ img
        [ Options.attribute <| src img_
        , css "height"
            ( case model.viewport of
                Types.Desktop -> "256px"
                Types.Tablet -> "128px"
                Types.Phone -> "128px"
            )
        ] []
    ]
    , Card.title []
        [ Card.head
            [ Color.text Color.white ]
            [ text title ]
        , div
            [ css "display" "flex"
            , css "flex-direction" "column"
            ]
            <| List.map (Card.subhead [ Color.text Color.white ])
            <| List.map (\text_ -> [ text_ ])
            <| List.map text text_
        , div []
            [ Button.render Mdl [0] model.mdl
                [ Button.raised
                , Button.link link_
                , Route.linkTo link_
                , Color.text Color.white
                , css "margin-top" "16px"
                ] [ text "Saiba mais" ]
            ]
        ]
    ]

bannerAssistance : Model -> Html Msg
bannerAssistance model =
  bannerCard model
    "Solicite assistência técnica pelo autoatendimento"
    [ "É simples, rápido e você sabe exatamente quanto irá custar." ]
    "/assistencia"
    "calendar.svg"
    (Color.color Color.Cyan Color.S400)

bannerSupport : Model -> Html Msg
bannerSupport model =
  bannerCard model
    "Já fez uma solicitação?"
    [ "Veja como está o andamento do seu pedido."
    , "Mas, fique tranquilo que você será notificado das coisas importantes."
    ]
    "/andamento"
    "request.svg"
    (Color.color Color.Purple Color.S300)

bannerLawyers : Model -> Html Msg
bannerLawyers model =
  bannerCard model
    "Aos advogados"
    [ "Problemas com seu token ao acessar serviços governamentais?"
    , "Necessita de consultoria sobre sigilo e segurança na era da informação?"
    , "Gostaria de proteger as informações privadas dos seus clientes?"
    , "Pois então, conheça os serviços exclusivos para advogados."
    ]
    "/advogados"
    "scales.svg"
    Color.black

bannerSites : Model -> Html Msg
bannerSites model =
  bannerCard model
    "Lojas virtuais, catálogos, sites informacionais e outros tipos de website"
    [ "Faça a cotação ou agende uma reunião." ]
    "/dev"
    "website.svg"
    (Color.color Color.Lime Color.S700)

bannerApps : Model -> Html Msg
bannerApps model =
  bannerCard model
    "Pois é! Os smartphones dominaram o mundo!"
    [ "A Cibertexto Tecnologia pode criar o aplicativo que você precisa." ]
    "/dev"
    "mobile.svg"
    (Color.color Color.Orange Color.S300)

selectBanner : Model -> Html Msg
selectBanner model =
  case model.pages.home.banner of
    0 -> bannerAssistance model
    1 -> bannerSupport model
    2 -> bannerLawyers model
    3 -> bannerSites model
    4 -> bannerApps model
    _ -> bannerAssistance model

bannerWithTabs : Model -> Html Msg
bannerWithTabs model =
  div []
    [ Tabs.render Mdl [0] model.mdl
        [ Tabs.ripple
        , Tabs.onSelectTab Types.ChangeBannerHomePage
        , Tabs.activeTab model.pages.home.banner
        , css "display" "none" |> when
            (model.viewport == Types.Phone || model.viewport == Types.Tablet)
        ]
        [ Tabs.label
            [ Options.center ]
            [ text "Assistência" ]
        , Tabs.label
            [ Options.center ]
            [ text "Solicitação" ]
        , Tabs.label
            [ Options.center ]
            [ text "Advogados" ]
        , Tabs.label
            [ Options.center ]
            [ text "Sites" ]
        , Tabs.label
            [ Options.center ]
            [ text "Aplicativos" ]
        ]
        []
    , selectBanner model
    ]

-- INFO


infoCard : Model -> String -> String -> String -> String -> Html Msg
infoCard model title text_ link linkName =
  Card.view
    [ Elevation.e4
    , css "width" "100%"
    , css "height" "100%"
    , css "display" "flex"
    , css "flex-direction" "column"
    ]
    [ Card.title []
        [ Card.head
            [ Color.text Color.accent ]
            [ text title ]
        ]
    , Card.text
        [ css "flex" "1"
        , css "text-align" "justify"
        , css "width" "auto"
        ]
        [ text text_ ]
    , Card.actions [ Card.border ]
        [ Button.render Mdl [1] model.mdl
            [ Button.accent
            , Button.ripple
            , Button.link link
            ] [ text linkName ]
        ]
    ]

infoSupport : Model -> Html Msg
infoSupport model =
  infoCard model
    "Assistência técnica em computadores e celulares"
    """Seus problemas podem ser resolvidos rapidamente.
       Agende aqui mesmo e saiba na hora quanto vai custar.
       Basta seguir os passos para o agendamento."""
    "/assistencia"
    "Acesse"

infoPrivacy : Model -> Html Msg
infoPrivacy model =
  infoCard model
    "Sigilo e privacidade em primeiro lugar"
    """O maior diferencial da Cibertexto Tecnologia é o foco no sigilo e na segurança das informações dos clientes.
       A prioridade máxima do serviço de assistência é manter os dados pessoais dos clientes longe de qualquer intrusão."""
    "/sobre"
    "Saiba mais"

infoConsultation : Model -> Html Msg
infoConsultation model =
  infoCard model
    "Vamos manter você atualizado!"
    """Se você já solicitou assistência, consulte o andamento do seu pedido.
       A Cibertexto Tecnologia busca manter seus clientes sempre atualizados sobre a prestação do serviço."""
    "/andamento"
    "Consulte"


-- VIEW


render : Model -> Html Msg
render model =
  div []
    [ grid []
        [ cell [ size All 12 ] [ bannerWithTabs model ]
        , cell [ size All 12, size Desktop 4, stretch ] [ infoSupport model ]
        , cell [ size All 12, size Desktop 4, stretch ] [ infoPrivacy model ]
        , cell [ size All 12, size Desktop 4, stretch ] [ infoConsultation model ]
        ]
    ]
