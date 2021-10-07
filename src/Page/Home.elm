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
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
    [ "Lorem ipsum dolor sit amet, consectetur adipiscing elit." ]
    "#/assistencia"
    "calendar.svg"
    (Color.color Color.Cyan Color.S400)

bannerSupport : Model -> Html Msg
bannerSupport model =
  bannerCard model
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit?"
    [ "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    , "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    ]
    "#/andamento"
    "request.svg"
    (Color.color Color.Purple Color.S300)

bannerLawyers : Model -> Html Msg
bannerLawyers model =
  bannerCard model
    "Aos advogados"
    [ "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?"
    , "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?"
    , "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?"
    , "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt."
    ]
    "#/advogados"
    "scales.svg"
    Color.black

bannerSites : Model -> Html Msg
bannerSites model =
  bannerCard model
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do."
    [ "Eiusmod tempor incididunt ut labore et dolore magna aliqua." ]
    "#/dev"
    "website.svg"
    (Color.color Color.Lime Color.S700)

bannerApps : Model -> Html Msg
bannerApps model =
  bannerCard model
    "Eiusmod tempor incididunt ut labore et dolore magna aliqua."
    [ "Eiusmod tempor incididunt ut labore et dolore magna aliqua." ]
    "#/dev"
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
            [ text "Lorem" ]
        , Tabs.label
            [ Options.center ]
            [ text "Lorem" ]
        , Tabs.label
            [ Options.center ]
            [ text "Lorem" ]
        , Tabs.label
            [ Options.center ]
            [ text "Lorem" ]
        , Tabs.label
            [ Options.center ]
            [ text "Lorem" ]
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
    "Eiusmod tempor incididunt ut labore et dolore magna aliqua"
    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."""
    "#/assistencia"
    "Acesse"

infoPrivacy : Model -> Html Msg
infoPrivacy model =
  infoCard model
    "Eiusmod tempor incididunt ut labore et dolore magna aliqua."
    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."""
    "#/sobre"
    "Saiba mais"

infoConsultation : Model -> Html Msg
infoConsultation model =
  infoCard model
    "Eiusmod tempor incididunt ut labore et dolore magna aliqua."
    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."""
    "#/andamento"
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
