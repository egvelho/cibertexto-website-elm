module Model exposing (init, model)

import Task
import Window
import Navigation exposing (Location)
import Material
import Types exposing (Model, Msg, Mdl)
import Requests

model : Model
model =
  { mdl = Material.model
  , viewport = Types.Tablet
  , currentPage = Types.Home
  , pages =
      { home =
          { banner = 0 }
      , techSupport =
          { option = "main"
          , toggleFormatWithBackup = False
          , toggleStartupProblem = 0
          , toggleBackupOption = 0
          , urgency = False
          }
      , schedule =
          { order = Types.HelpOrder
          , scheduling = []
          , scheduleLoading = False
          , scheduleLoadError = False
          , place = 0
          , name = ""
          , phone = ""
          , address = ""
          , obs = ""
          , day = Types.DayScheduling [] 0 0 0 0
          , time = 0
          , resultLoading = False
          , result = Types.RequestResult "" ""
          }
      , order =
          { loadingOrder = False
          , id = ""
          , result =
              Types.OrderResult
              ""
              ( Types.OrderItem
                  "" "" ""
                  False False
                  0 0
                  "" "" "" "" ""
                  0 0
                  (Types.OrderItemDate 0 0 0 0 0)
              )
          }
      }
  }

init : Location -> (Model, Cmd Msg)
init location =
  let page =
    case location.hash of
      "#/home" ->
        Types.Home

      "#/assistencia" ->
        Types.TechSupport

      "#/andamento" ->
        Types.Order

      "#/advogados" ->
        Types.Lawyers

      "#/dev" ->
        Types.Development

      "#/sobre" ->
        Types.About

      "#/agendamento" ->
        Types.Home

      _ ->
        Types.Home
  in
    ( { model | currentPage = page }
    , Cmd.batch
        [ Material.init Mdl
        , Window.size |> Task.perform Types.UpdateViewport
        ]
    )
