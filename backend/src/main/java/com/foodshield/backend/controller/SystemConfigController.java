package com.foodshield.backend.controller;

import com.foodshield.backend.model.SystemConfig;
import com.foodshield.backend.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/settings")
public class SystemConfigController {

    @Autowired
    private SystemConfigService systemConfigService;

    @GetMapping
    public ResponseEntity<SystemConfig> getSettings() {
        return ResponseEntity.ok(systemConfigService.getGlobalConfig());
    }

    @PutMapping
    public ResponseEntity<SystemConfig> updateSettings(@RequestBody SystemConfig config) {
        return ResponseEntity.ok(systemConfigService.updateGlobalConfig(config));
    }
}
