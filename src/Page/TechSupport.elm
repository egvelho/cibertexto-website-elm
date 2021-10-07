module Page.TechSupport exposing (..)

import Markdown
import Html exposing (Html, text, p)
import Html.Attributes exposing (style)

import Material.Options as Options exposing (css, when, div)
import Material.Color as Color
import Material.Typography as Typography
import Material.Elevation as Elevation
import Material.Grid as Grid exposing (grid, cell, Device(..))
import Material.Button as Button
import Material.Toggles as Toggles
import Material.List as List
import Material.Card as Card

import Types exposing (Model, Msg, Mdl)

subHeader model =
  div
    [ Color.background Color.primary
    , Color.text Color.white
    , css "height" "256px"
    , css "padding" "0 40px"
    , css "display" "flex"
    , css "align-items" "flex-end"
    ]
    [ Options.styled Html.h1
        [ ( if model.pages.techSupport.option /= "" &&
                (model.viewport == Types.Phone || model.viewport == Types.Tablet) then
              css "display" "none"
            else
              Options.nop
          )
        , css "font-size" "48px"
        ]
        [ text "Lorem ipsum dolor?" ]
    ]

techItem : Model -> String -> String -> String -> Html Msg
techItem model text_ img_ option_ =
  List.li
    [ css "cursor" "pointer"
    , Options.onClick
        <| Types.SelectOptionTechSupportPage option_
    , Options.many
        [ Color.background (Color.color Color.Grey Color.S200)
        , css "border-radius" "2px"
        ] |> when
              (model.pages.techSupport.option == option_)
    ]
    [ List.content []
        [ List.avatarImage img_
            [ css "display" "block"
            , css "width" "40px"
            , css "height" "40px"
            ]
        , text text_
        ]
    ]

techItems : Model -> Html Msg
techItems model =
  List.ul
    [ css "padding-left" "8px"
    , css "padding-right" "8px"
    ]
    [ techItem model
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
        "format.png"
        "format"
    , techItem model
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
        "stopped.png"
        "programProblem"
    , techItem model
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
        "adware.png"
        "trollProgram"
    , techItem model
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
        "confusion.png"
        "startupProblem"
    , techItem model
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
        "lost-files.png"
        "lostFiles"
    , techItem model
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
        "slow.png"
        "slowProblem"
    , techItem model
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
        "new-program.png"
        "newProgram"
    , techItem model
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
        "backup.png"
        "backup"
    , techItem model
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
        "virus.png"
        "virus"
    , techItem model
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
        "help.png"
        "help"
    ]

optionView : Model -> String -> String -> Types.Order -> Html Msg -> Html Msg
optionView model title_ subtitle_ order_ content=
  Card.view
    [ Elevation.e8
    , css "margin-top" "-99px"
    , css "width" "100%"
    ]
    [ Card.title []
        [ Card.head
            [ Color.text Color.accent ]
            [ text title_ ]
        , Card.subhead
            []
            [ Markdown.toHtml [] subtitle_ ]
        ]
    , Card.text [] [ content ]
    , Card.actions
        [ Card.border
        , css "display" "none" |>
            when
              ( model.pages.techSupport.option == "main" &&
                model.viewport == Types.Desktop
              )
        ]
        [ Button.render Mdl [5] model.mdl
            [ Button.accent
            , Button.ripple
            , Options.onClick <| Types.SelectOptionTechSupportPage ""
            , css "display" "none" |>
                when (model.viewport == Types.Desktop)
            ]
            [ text
                ( if model.pages.techSupport.option == "main" then
                    "Continuar"
                  else
                    "Voltar"
                )
            ]
        , Button.render Mdl [6] model.mdl
            [ Button.accent
            , Button.ripple
            , Options.onClick <| Types.SelectOrderSchedulePage order_
            , css "display" "none" |>
                when (model.pages.techSupport.option == "main")
            ]
            [ text "Agendar" ]
        ]
    ]

mainOption : Model -> Html Msg
mainOption model =
  optionView model
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    ( if (model.viewport == Types.Desktop) then
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
      else
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    )
    Types.HelpOrder
    <| div []
        [ Markdown.toHtml []
            """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."""
        , Markdown.toHtml []
            """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor [website](/dev) ou
            [aplicativo para celular](/dev)?"""
        ]

formatOption : Model -> Html Msg
formatOption model =
  optionView model
    "Lorem ipsum"
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    Types.FormatOrder
    ( let
        withBackup =
          model.pages.techSupport.toggleFormatWithBackup
        urgency =
          model.pages.techSupport.urgency
      in
        grid []
          [ cell [ Grid.size All 12 ]
              [ Toggles.radio Mdl [0] model.mdl
                  [ Toggles.ripple
                  , Toggles.value (withBackup == False)
                  , Toggles.group "formatOptionBackup"
                  , Options.onToggle (Types.ToggleFormatBackupTechSupportPage False)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" ]
              ]
          , cell [ Grid.size All 12 ]
              [ Toggles.radio Mdl [1] model.mdl
                  [ Toggles.ripple
                  , Toggles.value (withBackup == True)
                  , Toggles.group "formatOptionBackup"
                  , Options.onToggle (Types.ToggleFormatBackupTechSupportPage True)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" ]
              ]
          , cell [ Grid.size All 12 ]
              [ Toggles.switch Mdl [2] model.mdl
                  [ Toggles.ripple
                  , Toggles.value urgency
                  , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++
                      ( if (withBackup && urgency) then
                          "XXX,XX"
                        else if withBackup then
                          "XXX,XX"
                        else if urgency then
                          "XXX,XX"
                        else
                          "XXX,XX"
                      )
                  ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Lorem ipsum dolor " ++ ( if urgency then "2 dias" else "7 dias" ) ]
              ]
          ]
    )

programProblemOption : Model -> Html Msg
programProblemOption model =
  optionView model
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    Types.ProgramProblemOrder
    ( let urgency =
        model.pages.techSupport.urgency
      in
        grid []
          [ cell [ Grid.size All 12 ]
              [ Toggles.switch Mdl [2] model.mdl
                  [ Toggles.ripple
                  , Toggles.value urgency
                  , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if urgency then "XXX,XX" else "XXX,XX" ) ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Entrega " ++ ( if urgency then "na hora!" else "em 3 dias" ) ]
              ]
          ]
    )

trollProgramOption : Model -> Html Msg
trollProgramOption model =
  optionView model
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    Types.TrollProgramOrder
    ( let urgency =
        model.pages.techSupport.urgency
      in
        grid []
          [ cell [ Grid.size All 12 ]
              [ Toggles.switch Mdl [2] model.mdl
                  [ Toggles.ripple
                  , Toggles.value urgency
                  , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if urgency then "XXX,XX" else "XXX,XX") ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Entrega " ++ ( if urgency then "na hora!" else "em 2 dias" ) ]
              ]
          ]
    )

startupProblemOption : Model -> Html Msg
startupProblemOption model =
  optionView model
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"""
    Types.StartupProblemOrder
    ( let
        problem =
          model.pages.techSupport.toggleStartupProblem
        urgency =
          model.pages.techSupport.urgency
      in
        grid []
          [ cell [ Grid.size All 12 ]
              [ Toggles.radio Mdl [0] model.mdl
                  [ Toggles.ripple
                  , Toggles.value (problem == 0)
                  , Toggles.group "startupOptionProblem"
                  , Options.onToggle (Types.ToggleStartupProblemTechSupportPage 0)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" ]
              ]
          , cell [ Grid.size All 12 ]
              [ Toggles.radio Mdl [1] model.mdl
                  [ Toggles.ripple
                  , Toggles.value (problem == 1)
                  , Toggles.group "startupOptionProblem"
                  , Options.onToggle (Types.ToggleStartupProblemTechSupportPage 1)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" ]
              ]
            , cell [ Grid.size All 12 ]
              [ Toggles.radio Mdl [2] model.mdl
                  [ Toggles.ripple
                  , Toggles.value (problem == 2)
                  , Toggles.group "startupOptionProblem"
                  , Options.onToggle (Types.ToggleStartupProblemTechSupportPage 2)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" ]
              ]
          , cell [ Grid.size All 12 ]
              [ Toggles.switch Mdl [3] model.mdl
                  [ Toggles.ripple
                  , Toggles.value urgency
                  , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++
                      ( let price =
                          if urgency then
                            120
                          else
                            80
                        in
                          case problem of
                            0 -> (++) (toString price) ",00"
                            1 -> (++) (toString <| price + 20) ",00"
                            2 -> (++) (toString <| price + 300) ",00"
                            _ -> (++) (toString price) ",00"
                      )
                  ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Lorem ipsum dolor " ++ ( if urgency then "3 dias" else "7 dias" ) ]
              ]
          , cell [ Grid.size All 12 ]
              [ Options.styled p [ Typography.body2 ]
                  [ text <|
                      """OBS: Lorem ipsum dolor."""
                  ]
              ]
          ]
    )

lostFilesOption : Model -> Html Msg
lostFilesOption model =
  optionView model
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"""
    Types.LostFilesOrder
    ( let urgency =
        model.pages.techSupport.urgency
      in
        grid []
           [ cell [ Grid.size All 12 ]
               [ Options.styled p [ Typography.body2 ]
                   [ text <|
                       """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"""
                   ]
               ]
            , cell [ Grid.size All 12 ]
                [ Toggles.switch Mdl [0] model.mdl
                    [ Toggles.ripple
                    , Toggles.value urgency
                    , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                    , css "height" "auto"
                    ]
                    [ text "Lorem ipsum!" ]
                ]
            , cell [ Grid.size All 12, Grid.size Desktop 6 ]
                [ Options.styled p [ Typography.display2 ]
                    [ text <| "R$ " ++ ( if urgency then "XXX,XX" else "XXX,XX" ) ]
                ]
            , cell [ Grid.size All 12, Grid.size Desktop 6 ]
                [ Options.styled p [ Typography.headline ]
                    [ text <| "Entrega " ++ ( if urgency then "em 2 dias" else "em 5 dias" ) ]
                ]
           ]
      )

slowOption : Model -> Html Msg
slowOption model =
  optionView model
    "Lorem ipsum dolor sit amet"
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    Types.SlowProblemOrder
    ( let urgency =
        model.pages.techSupport.urgency
      in
        grid []
          [ cell [ Grid.size All 12 ]
              [ Toggles.switch Mdl [2] model.mdl
                  [ Toggles.ripple
                  , Toggles.value urgency
                  , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if urgency then "XXX,XX" else "XXX,XX" ) ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Lorem ipsum dolor " ++ ( if urgency then "2 dias" else "4 dias" ) ]
              ]
          ]
    )


newProgramOption : Model -> Html Msg
newProgramOption model =
  optionView model
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    "Lorem ipsum dolor sit amet"
    Types.NewProgramOrder
    ( let urgency =
        model.pages.techSupport.urgency
      in
        grid []
          [ cell [ Grid.size All 12 ]
              [ Toggles.switch Mdl [2] model.mdl
                  [ Toggles.ripple
                  , Toggles.value urgency
                  , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if urgency then "XXX,XX" else "XXX,XX" ) ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Lorem ipsum dolor " ++ ( if urgency then "1 dia" else "2 dias" ) ]
              ]
          , cell [ Grid.size All 12 ]
             [ Options.styled p [ Typography.body2 ]
                 [ Markdown.toHtml []
                     """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"""
                 ]
             , Options.styled p [ Typography.body2 ]
                 [ text
                     """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor!"""
                 ]
             ]
          ]
    )

backupOption : Model -> Html Msg
backupOption model =
  optionView model
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    Types.BackupOrder
    ( let backupOption =
        model.pages.techSupport.toggleBackupOption
      in
        grid []
          [ cell [ Grid.size All 12 ]
              [ Toggles.radio Mdl [0] model.mdl
                  [ Toggles.ripple
                  , Toggles.value (backupOption == 0)
                  , Toggles.group "backupOption"
                  , Options.onToggle (Types.ToggleBackupOptionTechSupportPage 0)
                  , css "height" "auto"
                  ]
                  [ text
                      """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"""
                  ]
              ]
          , cell [ Grid.size All 12 ]
              [ Toggles.radio Mdl [1] model.mdl
                  [ Toggles.ripple
                  , Toggles.value (backupOption == 1)
                  , Toggles.group "backupOption"
                  , Options.onToggle (Types.ToggleBackupOptionTechSupportPage 1)
                  , css "height" "auto"
                  ]
                  [ text
                      """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"""
                  ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if backupOption == 0 then "XXX,XX" else "XXX,XX" ) ]
              , Options.styled p
                 [ Typography.headline
                 , css "display" "none" |> when (backupOption == 0)
                 ]
                 [ text " + custo do dispositivo" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Lorem ipsum dolor 8 dias" ]
              ]
          ]
    )


virusOption : Model -> Html Msg
virusOption model =
  optionView model
    "Lorem ipsum"
    """Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"""
    Types.VirusOrder
    ( let urgency =
        model.pages.techSupport.urgency
      in
        grid []
          [ cell [ Grid.size All 12 ]
              [ Toggles.switch Mdl [2] model.mdl
                  [ Toggles.ripple
                  , Toggles.value urgency
                  , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                  , css "height" "auto"
                  ]
                  [ text "Lorem ipsum!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if urgency then "XXX,XX" else "XXX,XX" ) ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Entrega " ++ ( if urgency then "na hora!" else "em 3 dias" ) ]
              ]
          ]
    )

helpOption : Model -> Html Msg
helpOption model =
  optionView model
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    Types.HelpOrder
    <| Options.styled p [ Typography.display2 ]
         [ text "R$ 50,00" ]

options : Model -> Html Msg
options model =
  case model.pages.techSupport.option of
    "main" ->
      mainOption model
    "format" ->
      formatOption model
    "programProblem" ->
      programProblemOption model
    "trollProgram" ->
      trollProgramOption model
    "startupProblem" ->
      startupProblemOption model
    "lostFiles" ->
      lostFilesOption model
    "slowProblem" ->
      slowOption model
    "newProgram" ->
      newProgramOption model
    "backup" ->
      backupOption model
    "virus" ->
      virusOption model
    "help" ->
      helpOption model
    _ ->
      text ""

render : Model -> Html Msg
render model =
  div []
    [ subHeader model
    , grid []
        [ cell
            [ Grid.size All 12
            , Grid.size Desktop 6
            , Grid.hide Phone |> when (model.pages.techSupport.option /= "")
            , Grid.hide Tablet |> when (model.pages.techSupport.option /= "")
            ]
            [ techItems model ]
        , cell
            [ Grid.size All 12
            , Grid.size Desktop 6
            , Grid.stretch
            ]
            [ options model ]
        ]
    ]
