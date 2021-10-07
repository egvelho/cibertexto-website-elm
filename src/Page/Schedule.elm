module Page.Schedule exposing (..)

import Material.Options as Options exposing (when, css, div)
import Material.Color as Color
import Material.Typography as Typography
import Material.Elevation as Elevation
import Material.Card as Card
import Material.Toggles as Toggles
import Material.Button as Button
import Material.Textfield as Textfield
import Material.Select as Select
import Material.Dropdown.Item as Item
import Material.Spinner as Spinner
import Material.Helpers as Helpers
import Material.Chip as Chip

import Navigation
import Http
import Json.Decode as Decode
import Html exposing (Html, text, p)
import Types exposing (Model, Msg, Mdl, Order(..))
import Generics exposing (monthToString, weekdayToString)
import Route

type alias Texts =
  { title : String
  , subtitle : String
  , place : String
  , obs : String
  , page : String
  }

getTexts : Model -> Texts
getTexts model =
  case model.pages.schedule.order of

    DevelopmentOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/dev"
      }

    LawyerOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/advogados"
      }

    FormatOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/assistencia"
      }

    ProgramProblemOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/assistencia"
      }

    TrollProgramOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/assistencia"
      }

    StartupProblemOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/assistencia"
      }

    LostFilesOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/assistencia"
      }

    SlowProblemOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/assistencia"
      }

    NewProgramOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/assistencia"
      }

    BackupOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/assistencia"
      }

    VirusOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/assistencia"
      }

    HelpOrder ->
      { title = "Eiusmod tempor incididunt!"
      , subtitle = "Eiusmod tempor incididunt."
      , place = "Eiusmod tempor incididunt"
      , obs = "Eiusmod tempor incididunt?"
      , page = "#/assistencia"
      }

backgroundImage : Html Msg
backgroundImage =
  Options.stylesheet
    """
      body {
        background-image: url("schedule-background.svg");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: top;
      }
    """

nameError : String -> Bool
nameError name =
  (String.length name) < 3

phoneLengthError : String -> Bool
phoneLengthError phone =
  (String.length phone) < 8

phoneError : String -> Bool
phoneError phone =
  case String.toInt phone of
    Err msg ->
      True
    Ok value ->
      False

addressError : String -> Bool
addressError address =
  (String.length address) < 8

disableSubmit : Model -> Bool
disableSubmit model =
  let schedule =
    model.pages.schedule
  in
    nameError schedule.name ||
    phoneLengthError schedule.phone ||
    phoneError schedule.phone ||
    (addressError schedule.address && schedule.place == 2) ||
    schedule.day.monthday == 0 ||
    schedule.time == 0

mountDayOption : Types.DayScheduling -> String
mountDayOption day_ =
  ( (toString day_.monthday) ++
    " de " ++
    (monthToString day_.month) ++
    ", " ++
    (weekdayToString day_.weekday)
  )

dateChooser : Model -> Html Msg
dateChooser model =
  div []
    ( let
        schedulePage =
          model.pages.schedule
      in
        if schedulePage.scheduleLoading == True then
          [ div
              [ Options.center ]
              [ Spinner.spinner
                  [ Spinner.active schedulePage.scheduleLoading ]
              ]
          ]
        else if schedulePage.scheduleLoadError == True then
          [ div
              [ Options.center
              , css "flex-direction" "column"
              ]
              [ Options.styled p
                  [ Typography.body2 ]
                  [ text "Ops! Ocorreu algum problema" ]
              , Button.render Mdl [40] model.mdl
                  [ Button.ripple
                  , Button.raised
                  , Options.onClick Types.LoadSchedulingSchedulePage
                  , css "margin-top" "16px"
                  , css "margin-bottom" "16px"
                  ]
                  [ text "Tentar novamente" ]
              ]
          ]
        else
          if schedulePage.day.monthday == 0 then
            [ Select.render Mdl [20] model.mdl
                [ Select.label "Escolha o dia"
                , Select.below
                , Select.floatingLabel
                , Select.ripple
                , Select.value <|
                    ( if schedulePage.day.monthday == 0 then
                        ""
                      else
                        mountDayOption schedulePage.day
                    )
                , css "width" "90%"
                , css "max-width" "512px"
                ]
                ( schedulePage.scheduling |> List.map
                  ( \day_ ->
                      Select.item
                        [ Item.onSelect <| Types.SelectDaySchedulePage day_ ]
                        [ text <| mountDayOption day_ ]
                  )
                )

            ]
          else
            [ Chip.span
                [ Chip.deleteClick
                    <| Types.SelectDaySchedulePage (Types.DayScheduling [] 0 0 0 0)
                , css "margin" "4px"
                ]
                [ Chip.contact Html.span
                    [ Color.background Color.primary
                    , Color.text Color.white
                    , css "font-size" "14px"
                    ]
                    [ text <| String.left 3 <| monthToString schedulePage.day.month ]
                , Chip.content []
                    [ text <| mountDayOption schedulePage.day ]
                ]
            , ( if schedulePage.time == 0 then
                  Select.render Mdl [20] model.mdl
                    [ Select.label "Escolha o horário"
                    , Select.floatingLabel
                    , Select.ripple
                    , Select.value <|
                        ( if schedulePage.time == 0 then
                            ""
                          else
                            (toString schedulePage.time) ++ " horas"
                        )
                    , css "width" "90%"
                    , css "max-width" "512px"
                    ]
                    ( schedulePage.day.hours |> List.map
                      ( \hour_ ->
                          Select.item
                            [ Item.onSelect <| Types.SelectTimeSchedulePage hour_ ]
                            [ text <| (toString hour_) ++ " horas" ]
                      )
                    )
                else
                  Chip.span
                    [ Chip.deleteClick
                        <| Types.SelectTimeSchedulePage 0
                    , css "margin" "4px"
                    ]
                    [ Chip.contact Html.span
                        [ Color.background Color.accent
                        , Color.text Color.white
                        , css "font-size" "14px"
                        ]
                        [ text <| String.left 3 <| weekdayToString schedulePage.day.weekday ]
                    , Chip.content []
                        [ text <| "Às " ++ (toString schedulePage.time) ++ " horas" ]
                    ]
              )
            ]
    )

scheduler : Model -> Texts -> Html Msg
scheduler model texts =
  Card.view
    [ css "width" "100%"
    , css "overflow" "initial"
    , Elevation.e8
    ]
    [ Card.title []
        [ Card.head
            [ Color.text Color.accent ]
            [ text texts.title ]
        , Card.subhead []
            [ text texts.subtitle ]
        ]
    , Card.text []
        [ Textfield.render Mdl [7] model.mdl
            [ Textfield.label "Seu nome"
            , Textfield.floatingLabel
            , Textfield.maxlength 35
            , Textfield.error "Precisa ter pelo menos 3 letras"
                |> when
                    ( (nameError model.pages.schedule.name) &&
                      (not <| String.isEmpty model.pages.schedule.name)
                    )
            , Options.onInput Types.UpdateNameSchedulePage
            , css "width" "90%"
            , css "max-width" "512px"
            ] []
        , Textfield.render Mdl [8] model.mdl
            [ Textfield.label "Seu celular"
            , Textfield.floatingLabel
            , Textfield.maxlength 12
            , Textfield.error "Somente números são permitidos"
                |> when
                    ( (phoneError model.pages.schedule.phone) &&
                      (not <| String.isEmpty model.pages.schedule.phone)
                    )
            , Textfield.error "Precisa ter pelo menos 8 números"
                |> when
                    ( (phoneLengthError model.pages.schedule.phone) &&
                      (not <| String.isEmpty model.pages.schedule.phone)
                    )
            , Options.onInput Types.UpdatePhoneSchedulePage
            , css "width" "90%"
            , css "max-width" "512px"
            ] []
        ]
    , Card.text []
        [ Options.styled p
            [ Typography.headline ]
            [ text texts.place ]
        , Toggles.radio Mdl [0] model.mdl
            [ Toggles.ripple
            , Toggles.value (model.pages.schedule.place == 0)
            , Toggles.group "schedulePlace"
            , Options.onToggle (Types.TogglePlaceSchedulePage 0)
            , css "height" "auto"
            , css "display" "block"
            ]
            [ text "Endereço A" ]
        , Toggles.radio Mdl [1] model.mdl
            [ Toggles.ripple
            , Toggles.value (model.pages.schedule.place == 1)
            , Toggles.group "schedulePlace"
            , Options.onToggle (Types.TogglePlaceSchedulePage 1)
            , css "height" "auto"
            , css "display" "block"
            ]
            [ text "Endereço B" ]
        , Toggles.radio Mdl [2] model.mdl
            [ Toggles.ripple
            , Toggles.value (model.pages.schedule.place == 2)
            , Toggles.group "schedulePlace"
            , Options.onToggle (Types.TogglePlaceSchedulePage 2)
            , css "height" "auto"
            , css "display" "block"
            ]
            [ text "Endereço C" ]
        , ( case model.pages.schedule.place of
              0 ->
                Options.styled p
                  [ Typography.body2
                  , css "padding-top" "8px"
                  ]
                  [ text "Endereço A" ]
              1 ->
                Options.styled p
                  [ Typography.body2
                  , css "padding-top" "8px"
                  ]
                  [ text "Endereço B" ]
              2 ->
                Textfield.render Mdl [3] model.mdl
                  [ Textfield.label "Informe o endereço"
                  , Textfield.floatingLabel
                  , Textfield.maxlength 127
                  , Textfield.error "Precisa ter pelo menos 8 letras"
                      |> when
                          ( (addressError model.pages.schedule.address) &&
                            (not <| String.isEmpty model.pages.schedule.address)
                          )
                  , Options.onInput Types.UpdateAddressSchedulePage
                  , css "width" "90%"
                  , css "max-width" "512px"
                  ] []
              _ ->
                text ""
          )
        ]
    , Card.text
        [ css "overflow" "initial" ]
        [ Options.styled p
            [ Typography.headline ]
            [ text "Quando fica bom para você?" ]
        , dateChooser model
        ]
    , Card.text []
        [ Options.styled p
            [ Typography.headline ]
            [ text texts.obs ]
        , Textfield.render Mdl [6] model.mdl
            [ Textfield.label "Escreva aqui"
            , Textfield.textarea
            , Textfield.maxlength 127
            , Options.onInput Types.UpdateObsSchedulePage
            , css "width" "90%"
            , css "max-width" "512px"
            ] []
        , div
            [ Options.center
            , css "flex-direction" "column"
            ]
            [ Spinner.spinner
                [ Spinner.active
                    model.pages.schedule.resultLoading
                ]
            , ( if
                  ( not model.pages.schedule.resultLoading &&
                    model.pages.schedule.time == 0
                  )
                then
                  Options.styled p
                    [ Typography.body2
                    , Color.text <| Color.color Color.Red Color.S500
                    ]
                    [ ( case model.pages.schedule.result.status of
                          "unavailable" ->
                            text
                              """Ops! Parece que este horário foi ocupado enquanto você escolhia.
                              Por favor, agende outro horário."""
                          "error" ->
                            text
                              "Houve um problema de conexão. Por favor, tente novamente."
                          _ ->
                            text ""
                      )
                    ]
                else
                  text ""
              )
            ]
        ]
    , Card.actions
        [ Card.border ]
        [ Button.render Mdl [4] model.mdl
            [ Button.accent
            , Button.ripple
            , Route.linkTo texts.page
            ]
            [ text "Voltar" ]
        , Button.render Mdl [5] model.mdl
            [ Button.accent
            , Button.ripple
            , Button.disabled |> when (disableSubmit model)
            , Options.onClick Types.SendOrderSchedulePage
            ]
            [ text "Confirmar" ]
        ]
    ]

resultView : Model -> Html Msg
resultView model =
  let
    schedulePage =
      model.pages.schedule
  in
    div [] []

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
        [ scheduler model (getTexts model) ]
    ]
