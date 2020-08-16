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
        [ text "O que aconteceu?" ]
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
        "Preciso formatar meu computador!"
        "format.png"
        "format"
    , techItem model
        "Tem um programa que não está funcionando direito."
        "stopped.png"
        "programProblem"
    , techItem model
        "Um programa se instalou sozinho e não consigo removê-lo!"
        "adware.png"
        "trollProgram"
    , techItem model
        "Meu computador liga mas não inicia o Windows."
        "confusion.png"
        "startupProblem"
    , techItem model
        "Apaguei um arquivo importante sem querer. Quero recuperá-lo."
        "lost-files.png"
        "lostFiles"
    , techItem model
        "Meu computador/celular está lento..."
        "slow.png"
        "slowProblem"
    , techItem model
        "Preciso instalar um programa novo."
        "new-program.png"
        "newProgram"
    , techItem model
        "Gostaria de fazer backup de alguns arquivos..."
        "backup.png"
        "backup"
    , techItem model
        "Acho que peguei vírus... Estou preocupado com a segurança do meu computador/celular."
        "virus.png"
        "virus"
    , techItem model
        "Tenho algumas dúvidas, preciso de ajuda!"
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
    "Seja bem-vindo ao serviço de solicitação de assistência técnica!"
    ( if (model.viewport == Types.Desktop) then
        "Por favor, selecione a opção que mais se aproxima ao seu problema."
      else
        "Por favor, selecione a opção que mais se aproxima ao seu problema clicando em **continuar**."
    )
    Types.HelpOrder
    <| div []
        [ Markdown.toHtml []
            """Caso seu problema seja relativo à danos físicos no seu computador ou celular,
            como tela quebrada ou outras avarias, saiba que não trabalhamos com estes casos."""
        , Markdown.toHtml []
            """Ei! Psiu! Será que você não precisa de um [website](/dev) ou
            [aplicativo para celular](/dev)?"""
        ]

formatOption : Model -> Html Msg
formatOption model =
  optionView model
    "É inevitável!"
    "Como precisamos formatar nossos computadores de tempos em tempos, não é mesmo?"
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
                  [ text "Não preciso dos meus arquivos, pode apagar tudo." ]
              ]
          , cell [ Grid.size All 12 ]
              [ Toggles.radio Mdl [1] model.mdl
                  [ Toggles.ripple
                  , Toggles.value (withBackup == True)
                  , Toggles.group "formatOptionBackup"
                  , Options.onToggle (Types.ToggleFormatBackupTechSupportPage True)
                  , css "height" "auto"
                  ]
                  [ text "Preciso que você salve todos os meus arquivos, não posso perder nenhum." ]
              ]
          , cell [ Grid.size All 12 ]
              [ Toggles.switch Mdl [2] model.mdl
                  [ Toggles.ripple
                  , Toggles.value urgency
                  , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                  , css "height" "auto"
                  ]
                  [ text "Com urgência!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++
                      ( if (withBackup && urgency) then
                          "130,00"
                        else if withBackup then
                          "100,00"
                        else if urgency then
                          "110,00"
                        else
                          "80,00"
                      )
                  ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Entrega em " ++ ( if urgency then "2 dias" else "7 dias" ) ]
              ]
          ]
    )

programProblemOption : Model -> Html Msg
programProblemOption model =
  optionView model
    "E isso sempre acontece quando a gente mais precisa"
    "Mas, fique tranquilo que podemos ajudá-lo."
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
                  [ text "Com urgência!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if urgency then "50,00" else "30,00" ) ]
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
    "Também conhecidos como adware ou programas troll, se instalam silenciosamente..."
    "...e não importa o que você faça, eles continuam lá. Podemos resolver isso!"
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
                  [ text "Com urgência!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if urgency then "40,00" else "20,00" ) ]
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
    "Isso pode ser problemático..."
    """Quem sabe seja necessário substituir alguma peça do seu computador.
    Por favor, tente ligá-lo e verifique se:"""
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
                  [ text "Aparece uma tela como se o Windows fosse carregar, daí ele trava (ou reinicia)" ]
              ]
          , cell [ Grid.size All 12 ]
              [ Toggles.radio Mdl [1] model.mdl
                  [ Toggles.ripple
                  , Toggles.value (problem == 1)
                  , Toggles.group "startupOptionProblem"
                  , Options.onToggle (Types.ToggleStartupProblemTechSupportPage 1)
                  , css "height" "auto"
                  ]
                  [ text "O computador fica travado em uma tela preta com umas letras brancas" ]
              ]
            , cell [ Grid.size All 12 ]
              [ Toggles.radio Mdl [2] model.mdl
                  [ Toggles.ripple
                  , Toggles.value (problem == 2)
                  , Toggles.group "startupOptionProblem"
                  , Options.onToggle (Types.ToggleStartupProblemTechSupportPage 2)
                  , css "height" "auto"
                  ]
                  [ text "Liga por alguns segundos mas logo se desliga/reinicia" ]
              ]
          , cell [ Grid.size All 12 ]
              [ Toggles.switch Mdl [3] model.mdl
                  [ Toggles.ripple
                  , Toggles.value urgency
                  , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                  , css "height" "auto"
                  ]
                  [ text "Com urgência!" ]
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
                  [ text <| "Entrega em " ++ ( if urgency then "3 dias" else "7 dias" ) ]
              ]
          , cell [ Grid.size All 12 ]
              [ Options.styled p [ Typography.body2 ]
                  [ text <|
                      """OBS: Pode ser que seja necessário substituir alguma peça.
                      Nesse caso, o valor da peça será anexado ao valor da prestação do serviço."""
                  ]
              ]
          ]
    )

lostFilesOption : Model -> Html Msg
lostFilesOption model =
  optionView model
    "Por favor, desligue imediatamente o dispositivo onde o arquivo deletado estava"
    """Quanto mais você usa este dispositivo (computador, celular, pendrive e etc.),
    maior é a chance do seu arquivo se tornar irrecuperável."""
    Types.LostFilesOrder
    ( let urgency =
        model.pages.techSupport.urgency
      in
        grid []
           [ cell [ Grid.size All 12 ]
               [ Options.styled p [ Typography.body2 ]
                   [ text <|
                       """OBS: Nós não garantimos que seus arquivos serão recuperados.
                       Quanto menos tempo faz que seus arquivos foram apagados,
                       maior é a chance de recuperação. É recomendado que você desligue
                       seu computador ou celular imediatamente por este motivo. Se os
                       arquivos deletados estavam em uma câmera ou pendrive, não os use."""
                   ]
               ]
            , cell [ Grid.size All 12 ]
                [ Toggles.switch Mdl [0] model.mdl
                    [ Toggles.ripple
                    , Toggles.value urgency
                    , Options.onToggle (Types.ToggleUrgencyTechSupportPage)
                    , css "height" "auto"
                    ]
                    [ text "Com urgência!" ]
                ]
            , cell [ Grid.size All 12, Grid.size Desktop 6 ]
                [ Options.styled p [ Typography.display2 ]
                    [ text <| "R$ " ++ ( if urgency then "70,00" else "50,00" ) ]
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
    "É frustrante"
    "Mas, podemos dar um jeito nisso!"
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
                  [ text "Com urgência!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if urgency then "50,00" else "30,00" ) ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Entrega em " ++ ( if urgency then "2 dias" else "4 dias" ) ]
              ]
          ]
    )


newProgramOption : Model -> Html Msg
newProgramOption model =
  optionView model
    "Podemos instalar quantos você quiser"
    "E não vamos cobrar a mais por isso."
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
                  [ text "Com urgência!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if urgency then "40,00" else "30,00" ) ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Entrega em " ++ ( if urgency then "1 dia" else "2 dias" ) ]
              ]
          , cell [ Grid.size All 12 ]
             [ Options.styled p [ Typography.body2 ]
                 [ Markdown.toHtml []
                     """OBS: **Não instalamos programas pirata nos computadores/celulares
                     dos nossos clientes**. Portanto, se o que você precisa instalar
                     é um programa pago, por favor, compre uma licença de uso do
                     programa para que possamos efetuar a instalação."""
                 ]
             , Options.styled p [ Typography.body2 ]
                 [ text
                     """Por outro lado, podemos instalar uma versão de testes do
                     programa que você precisa. Estas versões geralmente funcionam
                     por 30 dias. Outra opção é instalar uma alternativa gratuita
                     ao programa que você precisa. Por favor, entre em contato
                     conosco para que possamos avaliar a situação!"""
                 ]
             ]
          ]
    )

backupOption : Model -> Html Msg
backupOption model =
  optionView model
    "Excelente iniciativa!"
    "O backup é uma garantia de que você não irá perder seus arquivos importantes."
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
                      """Vou fornecer o dispositivo onde os arquivos
                      serão armazenados (hd externo, pendrive e etc.)"""
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
                      """Não tenho onde armazenar os arquivos,
                     preciso que você me forneça este dispositivo"""
                  ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if backupOption == 0 then "90,00" else "110,00" ) ]
              , Options.styled p
                 [ Typography.headline
                 , css "display" "none" |> when (backupOption == 0)
                 ]
                 [ text " + custo do dispositivo" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.headline ]
                  [ text <| "Entrega em 8 dias" ]
              ]
          ]
    )


virusOption : Model -> Html Msg
virusOption model =
  optionView model
    "Pode ficar tranquilo"
    """É bem improvável que seja alguma coisa preocupante.
    Porém, entre em contato conosco para realizarmos uma
    verificação e, em caso de malware, remoção da ameaça.
    Além disso, vamos orientá-lo sobre como
    se proteger na era da informação!"""
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
                  [ text "Com urgência!" ]
              ]
          , cell [ Grid.size All 12, Grid.size Desktop 6 ]
              [ Options.styled p [ Typography.display2 ]
                  [ text <| "R$ " ++ ( if urgency then "60,00" else "40,00" ) ]
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
    "Podemos agendar uma reunião"
    "E suas dúvidas serão respondidas."
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
